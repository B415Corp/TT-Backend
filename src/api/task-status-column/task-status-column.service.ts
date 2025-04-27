import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { TaskStatusColumn } from 'src/entities/task-status-colunt.entity';
import { TaskStatus } from 'src/entities/task-status.entity';
import { Repository } from 'typeorm';
import { UpdateTaskStatusColumtDTO } from './dto/update-task-status-column.dto';
import { CreateTaskStatusColumtDTO } from './dto/create-task-status-column.dto';

@Injectable()
export class TaskStatusColumnService {
  constructor(
    @InjectRepository(TaskStatusColumn)
    private taskStatusColumnRepository: Repository<TaskStatusColumn>,
    @InjectRepository(TaskStatus)
    private taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async getByProjectId(project_id: string) {
    const res = this.taskStatusColumnRepository.find({
      where: { project: { project_id } },
    });
    return res;
  }

  async create(project_id: string, dto: CreateTaskStatusColumtDTO) {
    const project = await this.projectRepository.findOne({
      where: { project_id },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    const taskStatusColumn = this.taskStatusColumnRepository.create({
      ...dto,
      project,
    });
    return this.taskStatusColumnRepository.save(taskStatusColumn);
  }

  async createManyDefault(project_id: string) {
    const project = await this.projectRepository.findOne({
      where: { project_id },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    const taskStatusColumn = this.taskStatusColumnRepository.create([
      {
        order: 1,
        name: 'TO DO',
        color: '#a8a29e',
        project,
      },
      {
        order: 2,
        name: 'IN PROGRESS',
        color: '#fbbf24',
        project,
      },
      {
        order: 3,
        name: 'BLOCKED',
        color: '#f87171',
        project,
      },
      {
        order: 4,
        name: 'DONE',
        color: '#4ade80',
        project,
      },
    ]);
    return this.taskStatusColumnRepository.save(taskStatusColumn);
  }

  async update(task_id: string, dto: UpdateTaskStatusColumtDTO) {
    const taskStatusColumn = await this.taskStatusColumnRepository.findOne({
      where: { id: task_id },
    });
    if (!taskStatusColumn) {
      throw new Error('Task status column not found');
    }
    taskStatusColumn.order = dto.order;
    taskStatusColumn.name = dto.name;
    return this.taskStatusColumnRepository.save(taskStatusColumn);
  }

  async delete(id: string) {
    return this.taskStatusColumnRepository.delete(id);
  }
}
