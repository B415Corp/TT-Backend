import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto, user_owner_id: string): Promise<Project> {
    const client = this.projectRepository.create({
      ...dto,
      user_owner_id,
      user_ids: [],
    });
    return this.projectRepository.save(client);
  }

  async findById(id: string): Promise<Project | undefined> {
    if (!id) {
      throw new Error('Проект не найден');
    }
    return this.projectRepository.findOneBy({ project_id: id });
  }

  async findByKey(
    key: keyof Project,
    value: string,
    paginationQuery: PaginationQueryDto,
  ) {
    if (!value || !key) {
      throw new Error('Проект не найден');
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
