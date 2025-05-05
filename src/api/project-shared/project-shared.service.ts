import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { Project } from 'src/entities/project.entity';
import { Not, Repository } from 'typeorm';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ProjectWithMembersDto } from '../projects/dto/project-with-members.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { FriendshipService } from '../friendship/friendship.service';

@Injectable()
export class ProjectSharedService {
  constructor(
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
      .andWhere('project_member.role != :role', { role: ProjectRole.OWNER }) // Exclude role "owner"
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
      relations: ['project', 'project.user'],
      select: {
        member_id: true,
        project_id: true,
        role: true,
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
      where: { project_id: projectId, role: ProjectRole.OWNER },
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
      relations: ['user'],
      select: {
        user: {
          user_id: true,
          email: true,
          name: true,
        },
      },
    });
  }

  async patchSharedRole(
    project_id: string,
    role: ProjectRole,
    user_id: string
  ): Promise<ProjectMember> {
    if (role === ProjectRole.OWNER) {
      throw new ForbiddenException(
        'Запрещено менять роль на ' + ProjectRole.OWNER
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

    if (!Object.values(ProjectRole).includes(projectMember.role)) {
      throw new Error('Invalid role found in project member');
    }

    return projectMember;
  }

  async getFriendsOnProject(user_id: string, project_id: string) {
    const usersFriends = await this.friendshipService.findAll(user_id);

    const projectMembers = await this.projectMemberRepository.find({
      where: {
        project_id: project_id,
        role: Not(ProjectRole.OWNER),
      },
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
}
