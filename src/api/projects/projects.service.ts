import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from '../../dto/create-project.dto';

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
      user_ids: [user_owner_id],
    });
    return this.projectRepository.save(client);
  }

  async findAll() {
    return this.projectRepository.find();
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Project not found');
    }
    return this.projectRepository.findOneBy({ project_id: id });
  }

  async findByKey(key: keyof Project, value: string) {
    if (!value || !key) {
      throw new Error('Project not found');
    }
    return this.projectRepository.findOneBy({ [key]: value });
  }

  async remove(project_id: string): Promise<void> {
    const result = await this.projectRepository.delete(project_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${project_id}" not found`);
    }
  }
}
