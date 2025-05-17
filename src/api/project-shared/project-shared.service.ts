import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { Project } from 'src/entities/project.entity';
import {
  FindManyOptions,
  FindOptionsRelationByString,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  Not,
  Repository,
} from 'typeorm';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ProjectWithMembersDto } from '../projects/dto/project-with-members.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { FriendshipService } from '../friendship/friendship.service';
import { Currency } from 'src/entities/currency.entity';
import { GetMembersByFilterDTO } from './dto/get-members-by-filter.dto';
import { PROJECT_MEMBER_FILTERLTER } from 'src/common/enums/project-member-filter.enum';
import { PatchMembersDto } from './dto/patch-members.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ProjectSharedService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private notificationService: NotificationService,
    private friendshipService: FriendshipService
  ) {}

  async findProjectsWithMembers(
    userId: string
  ): Promise<ProjectWithMembersDto[]> {
    const projectsWithMembers = await this.projectMemberRepository
      .createQueryBuilder('project_member')
      .leftJoinAndSelect('project_member.project', 'project')
      .where('project_member.user_id = :userId', { userId })
      .andWhere('project_member.role != :role', { role: PROJECT_ROLE.OWNER }) // Exclude role "owner"
      .getMany();

    return projectsWithMembers.map((pm) => ({
      project: pm.project,
      shared: { role: pm.role, approved: pm.approve }, // Include only user ID without other related data
    }));
  }

  async getInvitations(userId: string): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: {
        user_id: userId,
        approve: false,
      },
      relations: ['project', 'project.user', 'currency'],
      select: {
        member_id: true,
        project_id: true,
        role: true,
        rate: true,
        payment_type: true,
        currency: {
          name: true,
          code: true,
          symbol: true,
        },
        project: {
          name: true,
          user: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Метод assignRole назначает роль участнику проекта.
  async assignRole(
    projectId: string,
    assignRoleDto: AssignRoleDto,
    ownerId: string
  ): Promise<ProjectMember> {
    // Ищем проект по его идентификатору и идентификатору владельца.
    const project = await this.projectRepository.findOne({
      where: {
        project_id: projectId,
        user_owner_id: ownerId,
      },
      relations: ['user'],
    });

    // Если проект не найден, выбрасываем исключение.
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }

    // Проверка валюты
    const currencyExist = await this.currencyRepository.findOneBy({
      code: assignRoleDto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    // Ищем существующих участников с заданной ролью.
    const existingMembers = await this.projectMemberRepository.find({
      where: {
        project_id: projectId,
        user_id: assignRoleDto.user_id,
        role: assignRoleDto.role,
      },
    });

    // Если количество участников с этой ролью превышает 2, выбрасываем исключение.
    if (existingMembers.length >= 2) {
      throw new NotFoundException(ErrorMessages.USER_ROLE_LIMIT_EXCEEDED);
    }

    // Ищем участника проекта по его идентификатору.
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: assignRoleDto.user_id },
    });

    await this.notificationService.createNotification(
      assignRoleDto.user_id,
      `Пользователь {${project.user.name}:${project.user.user_id}} пригласил вас в проект ${project.name}`,
      NotificationType.PROJECT_INVITATION,
      ''
    );

    // Если участник не найден, создаем нового участника.
    if (!projectMember) {
      const newProjectMember = this.projectMemberRepository.create({
        ...assignRoleDto,
        project_id: projectId,
        currency: currencyExist,
        approve: false,
      });
      return this.projectMemberRepository.save(newProjectMember);
    }

    // Если участник найден, обновляем его роль.
    projectMember.role = assignRoleDto.role;
    return this.projectMemberRepository.save(projectMember);
  }

  async removeMember(
    project_id: string,
    user_id: string,
    user_me_id: string
  ): Promise<void> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: project_id, user_id: user_id },
      relations: ['project', 'user'],
    });

    const executerOnProject = await this.projectMemberRepository.findOne({
      where: { project_id: project_id, user_id: user_me_id },
      relations: ['project', 'user'],
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    await this.notificationService.createNotification(
      user_id,
      `Пользователь {${executerOnProject.user.name}:${executerOnProject.user.user_id}} удалил вас из проекта ${projectMember.project.name}`,
      NotificationType.PROJECT_INVITATION_ACCEPTED,
      JSON.stringify(projectMember.project)
    );

    await this.projectMemberRepository.delete(projectMember.member_id);
  }

  async approveMember(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
      relations: ['user', 'project'],
    });
    const projectOwner = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, role: PROJECT_ROLE.OWNER },
      relations: ['user', 'project'],
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    await this.notificationService.createNotification(
      projectOwner.user.user_id,
      `Пользователь {${projectMember.user.name}:${projectMember.user.user_id}} принял вашу приглашение в проект ${projectMember.project.name}`,
      NotificationType.PROJECT_INVITATION_ACCEPTED,
      ''
    );

    projectMember.approve = true;
    return this.projectMemberRepository.save(projectMember);
  }

  async getMembersByApprovalStatus(
    projectId: string
  ): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: { project_id: projectId },
      relations: ['user', 'currency'],
      select: {
        user: {
          user_id: true,
          email: true,
          name: true,
        },
        currency: {
          code: true,
          symbol: true,
          name: true,
        },
      },
    });
  }

  async patchSharedRole(
    project_id: string,
    role: PROJECT_ROLE,
    user_id: string
  ): Promise<ProjectMember> {
    if (role === PROJECT_ROLE.OWNER) {
      throw new ForbiddenException(
        'Запрещено менять роль на ' + PROJECT_ROLE.OWNER
      );
    }
    const sharedItem = await this.projectMemberRepository.findOne({
      where: { project_id, user_id },
    });

    if (!sharedItem) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    return this.projectMemberRepository.save(sharedItem);
  }

  async patchSharedMember(
    project_id: string,
    member_id: string,
    dto: PatchMembersDto,
    userMe: User
  ): Promise<ProjectMember> {
    if (dto.role === PROJECT_ROLE.OWNER) {
      throw new ForbiddenException(
        'Запрещено менять роль на ' + PROJECT_ROLE.OWNER
      );
    }

    const sharedItem = await this.projectMemberRepository.findOne({
      where: { project_id, member_id },
      relations: ['user', 'project', 'currency'],
    });

    if (!sharedItem) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    const preload = await this.projectMemberRepository.preload({
      project_id,
      member_id,
      ...dto,
    });
    if (!preload) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }
    const recipient = sharedItem?.user;

    if (sharedItem.user.user_id !== userMe.user_id) {
      if (sharedItem.rate !== preload.rate) {
        await this.notificationService.createNotification(
          recipient?.user_id,
          `Пользователь {${userMe.name}:${userMe.user_id}} изменил вашу ставку в проекте ${sharedItem?.project?.name} с ${sharedItem?.currency?.symbol}${sharedItem?.rate} на ${sharedItem?.currency?.symbol}${preload?.rate}`,
          NotificationType.PROJECT_INVITATION_ACCEPTED,
          ''
        );
      }

      if (sharedItem.payment_type !== preload.payment_type) {
        await this.notificationService.createNotification(
          recipient?.user_id,
          `Пользователь {${userMe.name}:${userMe.user_id}} изменил ваш способ оплаты в проекте ${sharedItem?.project?.name} с ${sharedItem?.payment_type} на ${preload?.payment_type}`,
          NotificationType.PROJECT_INVITATION_ACCEPTED,
          ''
        );
      }

      if (sharedItem.role !== preload.role) {
        await this.notificationService.createNotification(
          recipient?.user_id,
          `Пользователь {${userMe.name}:${userMe.user_id}} изменил вашу роль в проекте ${sharedItem?.project?.name} с ${sharedItem?.role} на ${preload?.role}`,
          NotificationType.PROJECT_INVITATION_ACCEPTED,
          ''
        );
      }
    }

    return this.projectMemberRepository.save(preload);
  }

  async getUserRoleInProject(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    if (!Object.values(PROJECT_ROLE).includes(projectMember.role)) {
      throw new Error('Invalid role found in project member');
    }

    return projectMember;
  }

  async getFriendsOnProject(user_id: string, project_id: string) {
    const usersFriends = await this.friendshipService.findAll(user_id);

    const projectMembers = await this.projectMemberRepository.find({
      where: {
        project_id: project_id,
        role: Not(PROJECT_ROLE.OWNER),
      },
      relations: ['currency'],
    });

    const _res = usersFriends.map((el) => {
      return {
        name: el.name,
        user_id: el.user_id,
        email: el.email,
        in_project:
          projectMembers.find((_el) => _el.user_id === el.user_id) || null,
      };
    });

    return _res;
  }

  async getMembersByFilter(dto: GetMembersByFilterDTO) {
    const relationsList:
      | FindOptionsRelationByString
      | FindOptionsRelations<ProjectMember> = ['user', 'currency'];

    const selectList:
      | FindOptionsSelect<ProjectMember>
      | FindOptionsSelectByString<ProjectMember> = {
      member_id: true,
      project_id: true,
      role: true,
      approve: true,
      payment_type: true,
      rate: true,
      user: {
        user_id: true,
        name: true,
        email: true,
      },
      currency: {
        name: true,
        code: true,
        symbol: true,
      },
    };

    function getFilter(): FindManyOptions<ProjectMember> {
      switch (dto.role) {
        case PROJECT_MEMBER_FILTERLTER.ALL:
          return {
            where: { project_id: dto.project_id },
            relations: relationsList,
            select: selectList,
          };
        case PROJECT_MEMBER_FILTERLTER.OWNER:
          return {
            where: { project_id: dto.project_id, role: PROJECT_ROLE.OWNER },
            relations: relationsList,
            select: selectList,
          };
        case PROJECT_MEMBER_FILTERLTER.SHARED:
          return {
            where: {
              project_id: dto.project_id,
              role: Not(PROJECT_ROLE.OWNER),
            },
            relations: relationsList,
            select: selectList,
          };

        default:
          return {
            where: { project_id: dto.project_id },
            relations: relationsList,
            select: selectList,
          };
      }
    }
    const members = await this.projectMemberRepository.find({
      ...getFilter(),
    });
    return members;
  }

  async leaveProject(project_id: string, member_id: string) {
    const projectOwner = await this.projectMemberRepository.findOne({
      where: { project_id: project_id, role: PROJECT_ROLE.OWNER },
      relations: ['user', 'project'],
    });
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: project_id, member_id: member_id },
      relations: ['user', 'project'],
    });
    if (projectMember.role === PROJECT_ROLE.OWNER) {
      throw new ConflictException('Владелец проекта не может покинуть проект');
    }

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    await this.notificationService.createNotification(
      projectOwner.user.user_id,
      `Пользователь {${projectMember.user.name}:${projectMember.user.user_id}} покинул проект ${projectMember.project.name} по своей инициативе. Все его данные остаются без изменений пока вы его не удалите с проекта`,
      NotificationType.PROJECT_LEAVE_FOR_OWNER,
      ''
    );

    await this.notificationService.createNotification(
      projectMember.user.user_id,
      `Вы {${projectMember.user.name}:${projectMember.user.user_id}} покинули проект ${projectMember.project.name} по своей инициативе. Все ваши данные в проекте остаются без изменений пока вы его не откажетесь от приглашения в проект`,
      NotificationType.PROJECT_LEAVE_FOR_USER,
      ''
    );

    projectMember.approve = false;
    return this.projectMemberRepository.save(projectMember);
  }

  async findMemberByMembereId(member_id: string) {
    return await this.projectMemberRepository.findOne({
      where: { member_id: member_id },
      relations: ['user', 'project', 'currency'],
    });
  }
}
