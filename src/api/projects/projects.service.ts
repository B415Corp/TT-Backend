import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { ProjectRole } from '../../common/enums/project-role.enum';
import { TaskStatusColumnService } from '../task-status-column/task-status-column.service';

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
    private taskStatusColumnService: TaskStatusColumnService
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
      ...dto,
      currency_id: currencyExist.currency_id,
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
      role: ProjectRole.OWNER,
      approve: true, // Assuming the owner is automatically approved
    });

    await this.projectMemberRepository.save(projectMember);

    return savedProject;
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepository.find({
      where: { project_id: id },
      relations: [
        'currency',
        'client',
        'members',
        'members.user',
        'members.user.subscriptions',
      ],
      select: {
        rate: true,
        project_id: true,
        name: true,
        created_at: true,
        currency: {
          name: true,
          code: true,
          symbol: true,
        },
        client: {
          client_id: true,
          name: true,
          contact_info: true,
        },
        members: {
          role: true,
          approve: true,
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

    return project[0];
  }

  async findMyProjects(user_id: string, paginationQuery: PaginationQueryDto) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.currency', 'currency')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('user.subscriptions', 'subscriptions')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('member.project_id')
          .from('project_members', 'member') // укажите реальное имя таблицы связей members, если отличается
          .leftJoin('member.user', 'memberUser')
          .where('memberUser.user_id = :user_id', { user_id })
          .andWhere('member.approve = true')
          .getQuery();
        return 'project.project_id IN ' + subQuery;
      })
      .orderBy('project.project_id', 'ASC')
      .skip(skip)
      .take(limit);

    const [projects, total] = await qb.getManyAndCount();
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

  async remove(id: string): Promise<void> {
    const project = await this.projectRepository.findOneBy({ project_id: id });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }

    // Сначала удаляем связанные записи в project_members
    await this.projectMemberRepository.delete({ project_id: id });

    // Теперь удаляем сам проект
    const deleteResult = await this.projectRepository.delete(id);
    if (!deleteResult.affected) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }
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
      currency_id: currencyExist.currency_id,
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
    const whereCondition: any = {
      user_owner_id: userId,
    };

    if (searchTerm) {
      whereCondition.name = ILike(`%${searchTerm}%`);
    }

    return this.projectRepository.find({
      where: whereCondition,
      relations: ['user', 'client', 'currency'],
      take: maxResults,
      skip: offset,
      order: { created_at: 'DESC' },
      select: {
        project_id: true,
        rate: true,
        name: true,
        created_at: true,
        updated_at: true,
        // user: {
        //   name: true,
        //   email: true,
        // },
        client: {
          client_id: true,
          name: true,
          contact_info: true,
        },
      },
    });
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
        role: ProjectRole.OWNER, // Set the role as OWNER
        approve: true, // Assuming the owner is automatically approved
      });

      await this.projectMemberRepository.save(projectMember);
    }
  }
}
