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
    private tagRepository: Repository<Tag>
  ) {}

  async create(dto: CreateProjectDto, user_owner_id: string): Promise<Project> {
    const findByName = await this.projectRepository.findOneBy({
      name: dto.name,
    });
    if (findByName) {
      throw new ConflictException(ErrorMessages.PROJECT_NAME_EXISTS);
    }

    const currencyExist = await this.currencyRepository.findOneBy({
      currency_id: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    // const user = await this.userRepository.findOneBy({ user_id: user_owner_id });
    const project = this.projectRepository.create({
      ...dto,
      user_owner_id,
      user_ids: [],
    });

    return this.projectRepository.save(project);
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepository.findOneBy({ project_id: id });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(id));
    }
    return project;
  }

  async addUser(
    project_id: string,
    new_user_id: string,
    user_owner_id: string
  ): Promise<Project | undefined> {
    const project = await this.projectRepository.findOne({
      where: {
        project_id,
        user_owner_id,
      },
    });

    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NO_ACCESS);
    }

    const newUser = await this.userRepository.findOneBy({
      user_id: new_user_id,
    });
    if (!newUser) {
      throw new NotFoundException(ErrorMessages.USER_TO_ADD_NOT_FOUND);
    }

    if (project.user_ids.includes(new_user_id)) {
      throw new ConflictException(ErrorMessages.USER_ALREADY_IN_PROJECT);
    }

    project.user_ids.push(new_user_id);
    await this.projectRepository.save(project);

    return this.projectRepository.findOneBy({ project_id });
  }

  async deleteUser(
    project_id: string,
    delete_user_id: string,
    user_owner_id: string
  ): Promise<Project | undefined> {
    const project = await this.projectRepository.findOne({
      where: {
        project_id,
        user_owner_id,
      },
    });

    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NO_ACCESS);
    }

    const newUser = await this.userRepository.findOneBy({
      user_id: delete_user_id,
    });
    if (!newUser) {
      throw new NotFoundException(ErrorMessages.USER_TO_DELETE_NOT_FOUND);
    }

    if (!project.user_ids.includes(delete_user_id)) {
      throw new ConflictException(ErrorMessages.USER_NOT_IN_PROJECT);
    }

    project.user_ids = project.user_ids.filter((el) => el !== delete_user_id);
    await this.projectRepository.save(project);

    return this.projectRepository.findOneBy({ project_id });
  }

  async findByKey(
    key: keyof Project,
    value: string,
    paginationQuery: PaginationQueryDto
  ) {
    if (!value || !key) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(''));
    }

    console.log('');

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
    const result = await this.projectRepository.delete(project_id);

    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(project_id));
    }
  }

  async update(
    project_id: string,
    dto: UpdateProjectDto
  ): Promise<Project | undefined> {
    const project = await this.projectRepository.preload({
      project_id,
      ...dto,
    });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(project_id));
    }

    return this.projectRepository.save(project);
  }

  async findByUserIdAndSearchTerm(userId: string, searchTerm: string) {
    return this.projectRepository.find({
      where: {
        user_owner_id: userId,
        name: ILike(`%${searchTerm}%`),
      },
      relations: ['user'],
    });
  }
}
