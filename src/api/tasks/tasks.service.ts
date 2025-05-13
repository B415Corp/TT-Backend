import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
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
import { TaskStatus } from '../../entities/task-status.entity';
import { TaskStatusService } from '../task-status/task-status.service';
import { TaskStatusColumnService } from '../task-status-column/task-status-column.service';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';
import { UpdateTaskOrderDTO } from './dto/update-task-order.dto';

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
    private taskMemberRepository: Repository<TaskMember>,
    private taskStatusService: TaskStatusService,
    private taskStatusColumnService: TaskStatusColumnService
  ) {}

  async create(
    dto: CreateTaskDto,
    user_id: string,
    project_id: string
  ): Promise<Task> {
    // Проверка проекта
    const project = await this.projectRepository.find({
      where: { project_id: project_id },
      relations: ['members'],
    });
    if (!project[0]) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND(project_id));
    }

    // Проверка валюты
    const currencyExist = await this.currencyRepository.findOneBy({
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    // Проверка статуса задачи
    if (dto.task_status_id) {
      const taskStatus = await this.taskRepository.manager
        .getRepository(TaskStatus)
        .findOne({
          where: { id: dto.task_status_id },
          relations: ['taskStatusColumn', 'taskStatusColumn.project'],
        });
      if (!taskStatus) {
        throw new NotFoundException('Task status not found');
      }
      if (
        !taskStatus.taskStatusColumn ||
        !taskStatus.taskStatusColumn.project ||
        taskStatus.taskStatusColumn.project.project_id !== project_id
      ) {
        throw new NotFoundException(
          'Task status does not belong to this project'
        );
      }
    }

    // Создаем задачу
    const task = this.taskRepository.create({
      ...dto,
      project_id,
      user_id,
      currency_id: currencyExist.currency_id,
    });

    // Сохраняем задачу
    const savedTask = await this.taskRepository.save(task);

    // Создаем связь между задачей и пользователем
    const taskMember = this.taskMemberRepository.create({
      task_id: savedTask.task_id,
      user_id: user_id,
    });
    await this.taskMemberRepository.save({
      ...taskMember,
      projectMember: project[0].members.find(
        (el) => el.role === PROJECT_ROLE.OWNER
      ),
    });

    // Сохраняем связь между задачей и пользователем, если у проекта есть владелец
    if (project[0].user_owner_id !== user_id) {
      const taskMemberOwner = this.taskMemberRepository.create({
        task_id: savedTask.task_id,
        user_id: project[0].user_owner_id,
      });
      await this.taskMemberRepository.save({
        ...taskMemberOwner,
        projectMember: project[0].members.find((el) => el.user_id === user_id),
      });
    }

    // Получаем первую колонку статуса
    const taskStatusColumtItem =
      await this.taskStatusColumnService.getByProjectId(project_id);

    if (taskStatusColumtItem) {
      // Устанавливаем статус
      const taskStatus = await this.taskStatusService.setStatusToTask({
        task_id: savedTask.task_id,
        task_status_column_id: taskStatusColumtItem[0].id,
      });
      savedTask.taskStatus = taskStatus;
    }

    // Возвращаем задачу
    return savedTask;
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { task_id: id },
      relations: [
        'currency',
        'taskStatus',
        'taskMembers',
        'project',
        'taskMembers.user',
        'taskStatus.taskStatusColumn',
      ],
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        payment_type: true,
        order: true,
        rate: true,
        created_at: true,
        project_id: true,
        currency: {
          currency_id: true,
          code: true,
          name: true,
          symbol: true,
        },
        taskStatus: {
          id: true,
          taskStatusColumn: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
        },
        project: {
          project_id: true,
          created_at: true,
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

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.currency', 'currency')
      .leftJoinAndSelect('task.taskStatus', 'taskStatus')
      .leftJoinAndSelect('taskStatus.taskStatusColumn', 'taskStatusColumn')
      .leftJoinAndSelect('task.taskMembers', 'taskMembers')
      .leftJoinAndSelect('taskMembers.user', 'taskMemberUser')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.project_id = :project_id', { project_id })
      // .andWhere('task.user_id = :userId', { userId })
      // Фильтрация по участнику (можно сделать через подзапрос или через JOIN)
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('tm.task_id')
          .from('task_members', 'tm') // укажите реальное имя таблицы связей
          .leftJoin('tm.user', 'tmUser')
          .where('tmUser.user_id = :userId', { userId })
          .getQuery();
        return 'task.task_id IN ' + subQuery;
      })
      .orderBy('task.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [tasks, total] = await qb.getManyAndCount();

    // Исключаем владельца проекта из taskMembers
    const filteredTasks = tasks.map((task: any) => {
      // project может быть null, но по логике задачи всегда должен быть
      const ownerId = task.project?.user_owner_id;
      if (Array.isArray(task.taskMembers) && ownerId) {
        task.taskMembers = task.taskMembers.filter(
          (member: any) => member.user?.user_id !== ownerId
        );
      }
      return task;
    });

    return [filteredTasks, total];
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const currencyExist = await this.currencyRepository.findOneBy({
      code: dto.currency_id,
    });
    if (!currencyExist) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }

    // Проверка статуса задачи
    if (dto.task_status_id) {
      const taskStatus = await this.taskRepository.manager
        .getRepository(TaskStatus)
        .findOne({
          where: { id: dto.task_status_id },
          relations: ['taskStatusColumn', 'taskStatusColumn.project'],
        });
      if (!taskStatus) {
        throw new NotFoundException('Task status not found');
      }
      // Получаем задачу для project_id
      const existingTask = await this.taskRepository.findOne({
        where: { task_id: id },
      });
      if (!existingTask) {
        throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(id));
      }
      if (
        !taskStatus.taskStatusColumn ||
        !taskStatus.taskStatusColumn.project ||
        taskStatus.taskStatusColumn.project.project_id !==
          existingTask.project_id
      ) {
        throw new NotFoundException(
          'Task status does not belong to this project'
        );
      }
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
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.currency', 'currency')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.taskStatus', 'taskStatus')
      .leftJoinAndSelect('task.taskMembers', 'taskMembers')
      .leftJoinAndSelect('taskMembers.user', 'taskMemberUser')
      .leftJoinAndSelect('taskStatus.taskStatusColumn', 'taskStatusColumn')
      .where('task.user_id = :userId', { userId })
      .orderBy('task.created_at', 'DESC')
      .take(maxResults)
      .skip(offset);

    if (searchTerm) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('task.name ILIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
            .orWhere('task.description ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('project.name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('taskMemberUser.name ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            })
            .orWhere('taskMemberUser.email ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
        })
      );
    }

    return query.getMany();
  }

  async findTasksByUserId(userId: string): Promise<Task[]> {
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return this.taskRepository.find({
      where: { user_id: userId, taskMembers: { user: { user_id: userId } } },
      relations: [
        'currency',
        'taskStatus',
        'taskMembers',
        'taskMembers.user',
        'taskStatus.taskStatusColumn',
      ],
      select: {
        task_id: true,
        name: true,
        description: true,
        is_paid: true,
        order: true,
        payment_type: true,
        rate: true,
        created_at: true,
        currency: {
          currency_id: true,
          code: true,
          name: true,
        },
        taskStatus: {
          id: true,
          taskStatusColumn: {
            id: true,
            name: true,
            color: true,
          },
        },
        taskMembers: {
          member_id: true,
          user: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateTaskOrder(dto: UpdateTaskOrderDTO) {
    // Получаем все задачи в проекте и колонке
    const tasks = await this.taskRepository.find({
      where: {
        project_id: dto.project_id,
        taskStatus: {
          taskStatusColumn: {
            id: dto.column_id,
          },
        },
      },
      relations: ['taskStatus', 'taskStatus.taskStatusColumn'],
    });

    // Обновляем order для каждой задачи из массива task_orders
    const updates = dto.task_orders.map(({ task_id, order }) => {
      const task = tasks.find((t) => t.task_id === task_id);
      if (task) {
        task.order = order;
        return this.taskRepository.save(task);
      }
      return null;
    });

    await Promise.all(updates);

    return { success: true };
  }
}
