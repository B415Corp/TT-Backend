import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Project } from '../../entities/project.entity';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';
import { Currency } from 'src/entities/currency.entity';
import { User } from '../../entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';
import { TaskMember } from '../../entities/task-shared.entity';
import { UpdateTaskDto } from './dto/update-task.dto';

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
    private userRepository: Repository<User>,
    @InjectRepository(TaskMember)
    private taskMemberRepository: Repository<TaskMember>
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
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    const task = this.taskRepository.create({
      ...dto,
      project_id,
      user_id,
      currency_id: currencyExist.currency_id,
    });

    const savedTask = await this.taskRepository.save(task);

    const taskMember = this.taskMemberRepository.create({
      task_id: savedTask.task_id,
      user_id: user_id,
    });

    await this.taskMemberRepository.save(taskMember);

    return savedTask;
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { task_id: id },
      relations: ['currency'],
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        payment_type: true,
        rate: true,
        created_at: true,
        currency: {
          currency_id: true,
          code: true,
          name: true,
        },
      },
    });
    if (!task) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(id));
    }
    return task;
  }

  async findByProjectId(
    project_id: string,
    userId: string,
    paginationQuery: PaginationQueryDto
  ) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.taskRepository.findAndCount({
      where: { project_id: project_id, user_id: userId },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['currency'],
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        payment_type: true,
        rate: true,
        created_at: true,
        currency: {
          currency_id: true,
          code: true,
          name: true,
        },
      },
    });

    return [data, total];
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const currencyExist = await this.currencyRepository.findOneBy({
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    const task = await this.taskRepository.preload({
      task_id: id,
      ...dto,
      currency_id: currencyExist.currency_id,
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

    console.log('task', task);

    return this.taskRepository.save(task);
  }

  async remove(task_id: string): Promise<void> {
    const result = await this.taskRepository.delete(task_id);

    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(task_id));
    }

    // Delete associated TaskMembers
    await this.taskMemberRepository.delete({ task_id });
  }

  async findByUserIdAndSearchTerm(
    userId: string,
    searchTerm: string,
    maxResults: number,
    offset: number
  ) {
    const whereCondition: any = {
      user_id: userId,
    };

    if (searchTerm) {
      whereCondition.name = ILike(`%${searchTerm}%`);
    }

    return this.taskRepository.find({
      where: whereCondition,
      relations: ['currency', 'user'],
      take: maxResults,
      skip: offset,
      order: { created_at: 'DESC' },
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        payment_type: true,
        rate: true,
        created_at: true,
        updated_at: true,
        user: {
          name: true,
          email: true,
        },
      },
    });
  }

  async findTasksByUserId(userId: string): Promise<Task[]> {
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return this.taskRepository.find({
      where: { user_id: userId },
      relations: ['currency'],
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        payment_type: true,
        rate: true,
        created_at: true,
        currency: {
          currency_id: true,
          code: true,
          name: true,
        },
      },
    });
  }
}
