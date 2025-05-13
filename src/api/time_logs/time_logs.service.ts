import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';
import { ErrorMessages } from '../../common/error-messages';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private timeLogRepository: Repository<TimeLog>
  ) {}

  async start(task_id: string, user_id: string): Promise<TimeLog> {
    if (!task_id || !user_id) {
      throw new BadRequestException(ErrorMessages.TASK_AND_USER_ID_REQUIRED);
    }

    const exist_user_log = await this.timeLogRepository.findOne({
      where: { user_id, status: 'in-progress' },
    });

    if (exist_user_log) {
      throw new ConflictException(
        `Пользователь с ID ${user_id} уже имеет начатую задачу.`
      );
    }

    const exist_log = await this.timeLogRepository.findOne({
      where: { task_id, user_id, status: 'in-progress' },
    });

    if (exist_log) {
      throw new ConflictException(ErrorMessages.TIME_LOG_ALREADY_STARTED);
    }

    const time_log = this.timeLogRepository.create({
      task_id,
      user_id,
      start_time: new Date(),
      end_time: new Date(),
      status: 'in-progress',
    });

    return this.timeLogRepository.save(time_log);
  }

  async stop(task_id: string, client_time: string): Promise<TimeLog> {
    // Если task_id не указан
    if (!task_id) {
      throw new BadRequestException('Необходимо указать task_id.');
    }

    const time_log = await this.timeLogRepository.findOne({
      where: { task_id, status: 'in-progress' },
    });

    // Если лог не найден
    if (!time_log) {
      throw new NotFoundException(ErrorMessages.TIME_LOG_NOT_STARTED);
    }

    // Если лог уже завершен
    if (time_log.status === 'completed') {
      throw new ConflictException(ErrorMessages.TIME_LOG_ALREADY_STOPPED);
    }

    const start_time = new Date(time_log.start_time).getTime();
    const server_end_time = Date.now();

    // Парсим client_time
    const client_end_time = new Date(client_time).getTime();

    // Проверяем валидность client_time
    const isClientTimeValid =
      !isNaN(client_end_time) &&
      Math.abs(server_end_time - client_end_time) <= 5000; // 5 секунд

    const end_time = isClientTimeValid ? client_end_time : server_end_time;

    const duration = end_time - start_time;

    return this.timeLogRepository.save({
      ...time_log,
      status: 'completed',
      duration,
      end_time: new Date(end_time),
    });
  }

  async findById(id: string): Promise<TimeLog> {
    const timeLog = await this.timeLogRepository.findOneBy({ log_id: id });
    if (!timeLog) {
      throw new NotFoundException(ErrorMessages.TIME_LOG_NOT_FOUND(id));
    }
    return timeLog;
  }

  async findTimeLogsByTaskId(
    task_id: string,
    user_id: string,
    paginationQuery: PaginationQueryDto
  ) {
    if (!task_id || !user_id) {
      throw new BadRequestException(ErrorMessages.TASK_AND_USER_ID_REQUIRED);
    }

    const { page, limit } = paginationQuery;

    if (!page || !limit || page <= 0 || limit <= 0) {
      throw new BadRequestException(
        'Параметры пагинации (page и limit) должны быть положительными числами.'
      );
    }

    const skip = (page - 1) * limit;

    const time_log = await this.timeLogRepository.findOne({
      where: { task_id, status: 'in-progress' },
    });

    if (time_log) {
      const start_time = new Date(time_log.start_time).getTime();
      const end_time = new Date().getTime();
      const duration = end_time - start_time;

      await this.timeLogRepository.update(time_log.log_id, { duration });
    }

    const [projects, total] = await this.timeLogRepository.findAndCount({
      where: { task_id, user_id },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    if (!projects.length) {
      throw new NotFoundException(
        `Временные отметки для задачи с ID "${task_id}" не найдены.`
      );
    }

    return [projects, total];
  }

  async findLatestLogInTask(task_id: string, user_id: string) {
    if (!task_id || !user_id) {
      throw new BadRequestException(ErrorMessages.TASK_AND_USER_ID_REQUIRED);
    }

    const latestLog = await this.timeLogRepository.findOne({
      where: { task_id, user_id },
      order: { created_at: 'DESC' },
    });

    if (!latestLog) {
      return null;
      // throw new NotFoundException(
      //   ErrorMessages.LATEST_TIME_LOG_NOT_FOUND(task_id)
      // );
    }

    // Получаем сумму всех duration
    const commonDuration = await this.timeLogRepository
      .createQueryBuilder('time_log')
      .select('SUM(time_log.duration)', 'sum')
      .where('time_log.task_id = :task_id', { task_id })
      .getRawOne();

    let totalDuration: number = Number(commonDuration?.sum ?? 0);

    // Если последний лог в процессе, добавляем разницу со start_time
    if (latestLog.status === 'in-progress' && latestLog.start_time) {
      const now: Date = new Date(); // Текущая дата и время
      const startTime: Date = new Date(latestLog.start_time); // Парсим строку в объект Date
      const diffInMs = now.getTime() - startTime.getTime();

      totalDuration += diffInMs;
    }

    latestLog.common_duration = totalDuration;

    return latestLog;
  }

  async remove(time_log_id: string): Promise<void> {
    if (!time_log_id) {
      throw new BadRequestException(ErrorMessages.TIME_LOG_ID_REQUIRED(''));
    }

    const result = await this.timeLogRepository.delete(time_log_id);

    if (result.affected === 0) {
      throw new NotFoundException(
        ErrorMessages.TIME_LOG_ID_REQUIRED(time_log_id)
      );
    }
  }

  async findLatestLogByUserId(userId: string): Promise<TimeLog> {
    if (!userId) {
      throw new BadRequestException(ErrorMessages.TOKEN_REQUIRED);
    }

    const latestLog = await this.timeLogRepository
      .createQueryBuilder('time_log')
      .leftJoin('time_log.task', 'task')
      .leftJoin('task.project', 'project')
      .leftJoin('project.members', 'project_members')
      .leftJoin('task.currency', 'currency')
      .select([
        'time_log.log_id',
        'time_log.status',
        'time_log.created_at',
        'task.task_id',
        'task.rate',
        'task.is_paid',
        'task.payment_type',
        'task.name',
        'project.project_id',
        'project.name',
        'project_members.member_id',
        'project_members.role',
        'currency.currency_id',
        'currency.name',
        'currency.code',
        'currency.symbol',
      ])
      .where('project_members.user_id = :userId', { userId })
      .andWhere('project_members.role IN (:...roles)', {
        roles: [
          PROJECT_ROLE.OWNER,
          PROJECT_ROLE.MANAGER,
          PROJECT_ROLE.EXECUTOR,
        ],
      })
      .orderBy('time_log.created_at', 'DESC')
      .getOne();

    if (!latestLog) {
      // throw new NotFoundException(
      //   ErrorMessages.LATEST_TIME_LOG_NOT_FOUND(userId)
      // );
      return null;
    }

    return latestLog;
  }
}
