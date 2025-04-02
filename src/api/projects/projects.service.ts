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
import { Tag } from '../../entities/tag.entity';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { ProjectRole } from '../../common/enums/project-role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>
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
    const project = await this.projectRepository.findOne({
      where: { project_id: id },
      relations: ['currency', 'client'],
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
      },
    });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(id));
    }
    return project;
  }

  async findMyProjects(
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
      order: { project_id: 'ASC' },
      relations: ['currency', 'client'], // Добавляем связь с валютой и клиентом
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
      },
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
        user: {
          name: true,
          email: true,
        },
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
