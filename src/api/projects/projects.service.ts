import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { Tag } from '../../entities/tag.entity';

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
  ) { }

  async create(dto: CreateProjectDto, user_owner_id: string): Promise<Project> {
    const findByName = await this.projectRepository.findOneBy({
      name: dto.name,
    });
    if (findByName) {
      throw new ConflictException('Проект с таким названием уже существует');
    }

    const currencyExist = await this.currencyRepository.findOneBy({ currency_id: dto.currency_id })
    if (!currencyExist) {
      throw new NotFoundException('Указанная валюта не найдена');
    }
    
    const user = await this.userRepository.findOneBy({ user_id: user_owner_id });
    const project = this.projectRepository.create({
      ...dto,
      user: user,
      user_ids: [],
    });

    return this.projectRepository.save(project);
  }

  async findById(id: string): Promise<Project | undefined> {
    if (!id) {
      throw new NotFoundException('Проект не найден');
    }
    return this.projectRepository.findOneBy({ project_id: id });
  }

  async findByKey(
    key: keyof Project,
    value: string,
    paginationQuery: PaginationQueryDto,
  ) {
    if (!value || !key) {
      throw new NotFoundException('Проект не найден');
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
    const result = await this.projectRepository.delete(project_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Проект с ID "${project_id}" не найден`);
    }
  }

  async update(
    project_id: string,
    dto: UpdateProjectDto,
  ): Promise<Project | undefined> {
    const project = await this.projectRepository.preload({
      project_id,
      ...dto,
    });
    if (!project) {
      throw new NotFoundException(`Проект с ID "${project_id}" не найден`);
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
