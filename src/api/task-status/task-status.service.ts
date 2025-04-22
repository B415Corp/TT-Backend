import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from 'src/entities/task-status.entity';
import { TaskStatusColumn } from 'src/entities/task-status-colunt.entity';
import { CreateTaskStatusDTO } from './dto/create-task-status.dto';
import { Task } from 'src/entities/task.entity';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(TaskStatus)
    private taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskStatusColumn)
    private taskStatusColumnRepository: Repository<TaskStatusColumn>
  ) {}

  async setStatusToTask(dto: CreateTaskStatusDTO) {
    const taskStatusColumn = await this.taskStatusColumnRepository.findOne({
      where: { id: dto.task_status_column_id },
    });
    const task = await this.taskRepository.findOne({
      where: { task_id: dto.task_id },
    });

    if (!task) {
      throw new Error('Task not found');
    }
    if (!taskStatusColumn) {
      throw new Error('Task status column not found');
    }
    if (!taskStatusColumn) {
      throw new Error('Task status column not found');
    }

    const taskStatus = this.taskStatusRepository.create({
      task: task,
      taskStatusColumn,
    });

    return this.taskStatusRepository.save(taskStatus);
  }
}
