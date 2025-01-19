import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { TimeLog } from '../../entities/time-logs.entity';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private timeLogRepository: Repository<TimeLog>,
  ) { }

  async start(task_id: string, user_id: string): Promise<TimeLog> {
    if (!task_id || !user_id) {
      throw new BadRequestException(
        'Необходимо указать как task_id, так и user_id.',
      );
    }

    const exist_user_log = await this.timeLogRepository.findOne({
      where: { user_id, status: 'in-progress' },
    });

    if (exist_user_log) {
      throw new ConflictException(
        `Пользователь с ID ${user_id} уже имеет начатую задачу.`,
      );
    }

    const exist_log = await this.timeLogRepository.findOne({
      where: { task_id, user_id, status: 'in-progress' },
    });

    if (exist_log) {
      throw new ConflictException(
        `Временная отметка с ID "${exist_log.log_id}" уже начата.`,
      );
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

  async stop(task_id: string): Promise<TimeLog> {
    if (!task_id) {
      throw new BadRequestException('Необходимо указать task_id.');
    }

    const time_log = await this.timeLogRepository.findOne({
      where: { task_id, status: 'in-progress' },
    });

    if (!time_log) {
      throw new NotFoundException(
        `В задаче с ID "${task_id}" нет активной временной отметки.`,
      );
    }

    if (time_log.status === 'completed') {
      throw new ConflictException(
        `Временная отметка в задаче с ID "${task_id}" уже завершена.`,
      );
    }

    const start_time = new Date(time_log.start_time).getTime();
    const end_time = new Date().getTime();
    const duration = end_time - start_time;

    return this.timeLogRepository.save({
      ...time_log,
      status: 'completed',
      duration,
      end_time: new Date(),
    });
  }

  async findById(id: string) {
    if (!id) {
      throw new BadRequestException('Необходимо указать ID временной отметки.');
    }

    const time_log = await this.timeLogRepository.findOneBy({
      log_id: id,
    });

    if (!time_log) {
      throw new NotFoundException(
        `Временная отметка с ID "${id}" не найдена.`,
      );
    }

    return time_log;
  }

  async findTimeLogsByTaskId(
    task_id: string,
    user_id: string,
    paginationQuery: PaginationQueryDto,
  ) {
    if (!task_id || !user_id) {
      throw new BadRequestException(
        'Необходимо указать как task_id, так и user_id.',
      );
    }

    const { page, limit } = paginationQuery;

    if (!page || !limit || page <= 0 || limit <= 0) {
      throw new BadRequestException(
        'Параметры пагинации (page и limit) должны быть положительными числами.',
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
        `Временные отметки для задачи с ID "${task_id}" не найдены.`,
      );
    }

    return [projects, total];
  }

  async findLatestLogInTask(task_id: string, user_id: string) {
    if (!task_id || !user_id) {
      throw new BadRequestException(
        'Необходимо указать как task_id, так и user_id.',
      );
    }

    const latestLog = await this.timeLogRepository.findOne({
      where: { task_id, user_id },
      order: { created_at: 'DESC' },
    });

    if (!latestLog) {
      throw new NotFoundException(
        `Последняя временная отметка для задачи с ID "${task_id}" не найдена.`,
      );
    }

    return latestLog;
  }

  async remove(time_log_id: string): Promise<void> {
    if (!time_log_id) {
      throw new BadRequestException('Необходимо указать time_log_id.');
    }

    const result = await this.timeLogRepository.delete(time_log_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Время с ID "${time_log_id}" не найдено.`);
    }
  }
}
