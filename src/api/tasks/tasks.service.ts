import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository, ILike } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Project } from '../../entities/project.entity';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';
import { Currency } from 'src/entities/currency.entity';
import { User } from '../../entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';

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
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(
    dto: CreateTaskDto,
    user_id: string,
    project_id: string
  ): Promise<Task> {
    const project = await this.projectRepository.findOneBy({ project_id });
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(project_id));
    }

    const currencyExist = await this.currencyRepository.findOneBy({
      currency_id: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    const task = this.taskRepository.create({
      ...dto,
      project_id,
      user_id,
    });
    return this.taskRepository.save(task);
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ task_id: id });
    if (!task) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(id));
    }
    return task;
  }

  async findByProjectId(project_id: string, userId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: {
        project_id: project_id,
        user_id: userId,
      },
    });

    if (!tasks.length) {
      throw new NotFoundException(ErrorMessages.NO_TASKS_FOUND);
    }

    return tasks;
  }

  async update(id: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({
      task_id: id,
      ...dto,
    });
    if (!task) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(id));
    }

    const project = await this.projectRepository.findOneBy({
      project_id: task.project_id,
    });

    if (!project) {
      throw new NotFoundException(
        ErrorMessages.PROJECT_NOT_FOUND(task.project_id)
      );
    }

    if (project.user_owner_id !== task.user_id) {
      throw new NotFoundException(ErrorMessages.UNAUTHORIZED);
    }

    return this.taskRepository.save(task);
  }

  async remove(task_id: string): Promise<void> {
    const result = await this.taskRepository.delete(task_id);

    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(task_id));
    }
  }

  async findByUserIdAndSearchTerm(userId: string, searchTerm: string) {
    return this.taskRepository.find({
      where: {
        user_id: userId,
        name: ILike(`%${searchTerm}%`),
      },
      relations: ['project'],
    });
  }

  async findTasksByUserId(userId: string): Promise<Task[]> {
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return this.taskRepository.find({ where: { user_id: userId } });
  }
}
