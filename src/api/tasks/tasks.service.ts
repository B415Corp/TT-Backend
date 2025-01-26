import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Project } from '../../entities/project.entity';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';
import { Currency } from 'src/entities/currency.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(TimeLog)
    private timeLogRepository: Repository<TimeLog>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  async create(
    dto: CreateTaskDto,
    user_id: string,
    project_id: string,
  ): Promise<Task> {
    const project = await this.projectRepository.findOne({
      where: { project_id },
    });
    if (!project) {
      throw new NotFoundException(`Задача с ID "${project_id}" не найдена`);
    }

    const currencyExist = await this.currencyRepository.findOneBy({ currency_id: dto.currency_id })
    if (!currencyExist) {
      throw new NotFoundException('Указанная валюта не найдена');
    }

    const task = this.taskRepository.create({
      ...dto,
      project_id,
      user_id,
    });
    return this.taskRepository.save(task);
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Задача не найдена');
    }
    const task = await this.taskRepository.findOneBy({ task_id: id });
    if (!task) {
      throw new NotFoundException(`Задача с ID "${id}" не найдена`);
    }

    return this.taskRepository.findOneBy({ task_id: id });
  }

  async findByProjectId(
    project_id: string,
    paginationQuery: PaginationQueryDto,
  ) {
    if (!project_id) {
      throw new Error('Задача не найдена');
    }
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: { project_id },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const tasksWithDuration = await Promise.all(
      tasks.map(async (task) => {
        const timeLogs = await this.timeLogRepository.find({
          where: { task_id: task.task_id },
        });
        const duration = timeLogs.reduce(
          (acc, timeLog) =>
            acc + (timeLog.end_time.getTime() - timeLog.start_time.getTime()),
          0,
        );

        return {
          ...task,
          duration,
        };
      }),
    );

    return [tasksWithDuration, total];
  }

  async update(id: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({
      task_id: id,
      ...dto,
    });
    if (!task) {
      throw new NotFoundException(`Задача с ID "${id}" не найдена`);
    }

    const project = await this.projectRepository.findOneBy({
      project_id: task.project_id,
    });

    if (!project) {
      throw new NotFoundException(`Проект с ID "${task.project_id}" не найден`);
    }

    if (project.user_owner_id !== task.user_id) {
      throw new NotFoundException(
        `Этот проект не принадлежит текущему пользователю`,
      );
    }

    return this.taskRepository.save(task);
  }

  async remove(task_id: string): Promise<void> {
    const result = await this.taskRepository.delete(task_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Задача с ID "${task_id}" не найдена`);
    }
  }
}
