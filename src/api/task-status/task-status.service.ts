import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';
import { TaskStatus } from 'src/entities/task-status.entity';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(TaskStatus)
    private taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async getByTaskId(task_id: string) {
    return this.taskStatusRepository.findOneBy({ id: task_id });
  }

  async create(taskStatus: TaskStatus) {
    return this.taskStatusRepository.save(taskStatus);
  }
}
