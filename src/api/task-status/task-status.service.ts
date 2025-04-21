import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';
import { TaskStatus } from 'src/entities/task-status.entity';
import { TaskStatusColumn } from 'src/entities/task-status-colunt.entity';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(TaskStatus)
    private taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(TaskStatusColumn)
    private taskStatusColumnRepository: Repository<TaskStatusColumn>
  ) {}

  async getByTaskId(task_id: string) {
    return this.taskStatusRepository.findOneBy({ id: task_id });
  }

  async findAll() {
    return this.taskStatusRepository.find();
  }

  async create(taskStatus: Partial<TaskStatus>) {
    return this.taskStatusRepository.save(taskStatus);
  }

  async findColumnById(id: string) {
    return this.taskStatusColumnRepository.findOneBy({ id });
  }

  async createColumn(data: Partial<TaskStatusColumn>) {
    return this.taskStatusColumnRepository.save(data);
  }

  async update(id: string, updateData: Partial<TaskStatus>) {
    await this.taskStatusRepository.update(id, updateData);
    return this.taskStatusRepository.findOneBy({ id });
  }

  async remove(id: string) {
    return this.taskStatusRepository.delete(id);
  }
}
