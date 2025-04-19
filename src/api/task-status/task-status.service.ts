import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from 'src/entities/task-status.entity';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(TaskStatus)
    private taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async findAll() {
    return await this.taskStatusRepository.find();
  }

  /**
   * Обновление TaskStatus по project_id (без id статуса)
   */
  async updateByProjectId(
    project_id: string,
    names: Array<{ name: string; order: number }>
  ) {
    // Найти проект
    const project = await this.projectRepository.findOneBy({ project_id });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Найти TaskStatus по project_id
    const taskStatus = await this.taskStatusRepository.findOne({
      where: { project: { project_id } },
      relations: ['project'],
    });
    if (!taskStatus) {
      throw new NotFoundException('TaskStatus not found');
    }

    // Обновить имена
    taskStatus.names = names;

    // Сохранить изменения
    return await this.taskStatusRepository.save(taskStatus);
  }

  async findById(id: string) {
    return await this.taskStatusRepository.findOneBy({ id });
  }

  async findByProjectId(project_id: string) {
    return await this.taskStatusRepository.find({
      where: { project: { project_id } },
    });
  }

  async create(
    project_id: string,
    names: Array<{ name: string; order: number }> = [
      { name: 'TO DO', order: 1 },
      { name: 'IN PROGRESS', order: 2 },
      { name: 'DONE', order: 3 },
    ]
  ) {
    if (!project_id) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectRepository.findOneBy({
      project_id: project_id,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    console.log('project_id', project_id);
    console.log('project', project);
    return await this.taskStatusRepository.save({ names, project });
  }

  async update(
    id: string,
    names: Array<{ name: string; order: number }>,
    project_id?: string
  ) {
    const taskStatus = await this.taskStatusRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!taskStatus) {
      throw new NotFoundException('TaskStatus not found');
    }

    taskStatus.names = names;

    if (project_id) {
      const project = await this.projectRepository.findOneBy({ project_id });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      taskStatus.project = project;
    }

    return await this.taskStatusRepository.save(taskStatus);
  }
}
