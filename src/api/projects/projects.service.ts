import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { PROJECT_ROLE } from '../../common/enums/project-role.enum';
import { TaskStatusColumnService } from '../task-status-column/task-status-column.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { GetProjectByIdDTO } from './dto/get-project-by-id.dto';
import { TimeLogsService } from '../time_logs/time_logs.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    private taskStatusColumnService: TaskStatusColumnService,
    private notificationService: NotificationService,
    private timeLogsService: TimeLogsService
  ) {}

  async create(dto: CreateProjectDto, user_owner_id: string): Promise<Project> {
    const findByName = await this.projectRepository.findOneBy({
      name: dto.name,
      user_owner_id,
    });
    if (findByName) {
      throw new ConflictException(ErrorMessages.PROJECT_NAME_EXISTS);
    }
    const currencyExist = await this.currencyRepository.findOneBy({
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }
    const project = this.projectRepository.create({
      name: dto.name,
      client_id: dto.client_id,
      user_owner_id,
    });

    const savedProject = await this.projectRepository.save(project);

    // Create default task status columns
    await this.taskStatusColumnService.createManyDefault(
      savedProject.project_id
    );

    // Create a ProjectMember entry for the owner
    const projectMember = this.projectMemberRepository.create({
      project_id: savedProject.project_id,
      user_id: user_owner_id,
      role: PROJECT_ROLE.OWNER,
      rate: dto.rate,
      currency: currencyExist,
      approve: true, // Assuming the owner is automatically approved
    });

    await this.projectMemberRepository.save(projectMember);

    return savedProject;
  }

  async findById(id: string, user_id: string): Promise<GetProjectByIdDTO> {
    const project = await this.projectRepository.find({
      where: { project_id: id },
      relations: [
        'client',
        'members',
        'members.currency',
        'members.user',
        'members.user.subscriptions',
      ],
      select: {
        project_id: true,
        name: true,
        created_at: true,
        client: {
          client_id: true,
          name: true,
          contact_info: true,
        },
        members: {
          member_id: true,
          role: true,
          approve: true,
          rate: true,
          payment_type: true,
          currency: {
            name: true,
            code: true,
            symbol: true,
          },
          user: {
            user_id: true,
            name: true,
            email: true,
            subscriptions: {
              planId: true,
              status: true,
            },
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(id));
    }

    const owner = project[0].members.find(
      (member) => member.role === PROJECT_ROLE.OWNER
    );

    const invitedUsers = project[0].members.filter(
      (member) => member.role !== PROJECT_ROLE.OWNER
    );

    const me: ProjectMember = project[0].members.find(
      (member) => member.user.user_id === user_id
    );

    const projectDuration: number =
      await this.timeLogsService.getTotalDurationByProject(
        project[0].project_id
      );

    return {
      project: project[0],
      info: {
        owner,
        isUserOwner: owner.user.user_id === user_id,
        invitedUsers,
        myRate: owner?.rate,
        myPaymentType: owner?.payment_type,
        myRole: me?.role,
        myCurrency: owner?.currency,
        client: project[0].client,
        projectDuration: projectDuration,
      },
    };
  }

  async findMyProjects(
    user_id: string,
    paginationQuery: PaginationQueryDto,
    filterQuery: ProjectFilterDto
  ) {
    const { page, limit } = paginationQuery;
    const {
      sortBy = 'project_id',
      sortOrder = 'ASC',
      role,
      client_id,
    } = filterQuery;
    const skip = (page - 1) * limit;

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.currency', 'currency')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.currency', 'memberCurrency')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('member.project_id')
          .from('project_members', 'member') // замените на вашу таблицу
          .where('member.user_id = :user_id', { user_id })
          .andWhere(role ? 'member.role = :role' : '1=1', { role })
          .getQuery();
        return 'project.project_id IN ' + subQuery;
      });

    if (client_id) {
      qb.andWhere('project.client_id = :client_id', { client_id });
    }

    if (sortBy === 'name' || sortBy === 'created_at') {
      qb.orderBy(
        `project.${sortBy}`,
        sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
      );
    } else {
      qb.orderBy('project.project_id', 'ASC');
    }

    qb.skip(skip).take(limit);

    // Получаем проекты
    const [projects, total] = await qb.getManyAndCount();

    // Сортируем участников каждого проекта в нужном порядке
    projects.forEach((project) => {
      project.members.sort((a, b) => {
        // Функция для приоритета роли
        function rolePriority(member) {
          if (member.role === 'owner') return 0;
          if (member.user.user_id === user_id) return 1;
          return 2;
        }
        return rolePriority(a) - rolePriority(b);
      });
    });

    return [projects, total];
  }

  async findByKey(
    key: keyof Project,
    value: string,
    paginationQuery: PaginationQueryDto
  ) {
    if (!value || !key) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(''));
    }

    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [projects, total] = await this.projectRepository.findAndCount({
      where: { [key]: value },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return [projects, total];
  }

  async remove(project_id: string): Promise<void> {
    const project = await this.projectRepository.find({
      where: { project_id: project_id },
      relations: ['user', 'members', 'members.user'],
    });
    if (!project[0] || !project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }

    if (project[0].members.length > 0) {
      project[0].members.map((member) => {
        if (member.approve && member.role !== PROJECT_ROLE.OWNER) {
          const memberRole = member.role;
          this.notificationService.createNotification(
            member.user.user_id,
            `Пользователь {${project[0].user.name}:${project[0].user.user_id}} удалил проект ${project[0].name}, в который вы были приглашены ранее как ${memberRole}`,
            NotificationType.PROJECT_DELETE,
            JSON.stringify(project[0])
          );
        }
      });
    }

    await this.projectRepository.delete(project_id);
  }

  async update(
    project_id: string,
    dto: UpdateProjectDto
  ): Promise<Project | undefined> {
    const currencyExist = await this.currencyRepository.findOneBy({
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    const project = await this.projectRepository.preload({
      project_id,
      ...dto,
    });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(project_id));
    }

    return this.projectRepository.save(project);
  }

  async findByUserIdAndSearchTerm(
    userId: string,
    searchTerm: string,
    maxResults: number,
    offset: number
  ) {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.members', 'member')
      .leftJoinAndSelect('member.currency', 'currency')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .where('project.user_owner_id = :userId', { userId })
      .orderBy('project.created_at', 'DESC')
      .take(maxResults)
      .skip(offset);

    if (searchTerm) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('project.name ILIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('client.name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('user.email ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
          // Добавьте другие поля для поиска здесь, если нужно
        })
      );
    }

    return query.getMany();
  }

  async createProjectMembersForExistingProjects(): Promise<void> {
    const projects = await this.projectRepository.find();

    for (const project of projects) {
      // Check if the user exists
      const userExists = await this.userRepository.findOneBy({
        user_id: project.user_owner_id,
      });
      if (!userExists) {
        console.warn(
          `User with ID ${project.user_owner_id} does not exist. Skipping project ${project.project_id}.`
        );
        continue; // Skip this project if the user does not exist
      }

      // Create a ProjectMember entry for the owner
      const projectMember = this.projectMemberRepository.create({
        project_id: project.project_id,
        user_id: project.user_owner_id, // Assuming the owner is the user who created the project
        role: PROJECT_ROLE.OWNER, // Set the role as OWNER
        approve: true, // Assuming the owner is automatically approved
      });

      await this.projectMemberRepository.save(projectMember);
    }
  }
}
