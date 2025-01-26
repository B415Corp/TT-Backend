import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { Currency } from 'src/entities/currency.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
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
    
    const client = this.projectRepository.create({
      ...dto,
      user_owner_id,
      user_ids: [],
    });
    return this.projectRepository.save(client);
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
}
