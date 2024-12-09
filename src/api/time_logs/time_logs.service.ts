import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeLog } from '../../entities/time-logs.entity';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private timeLogRepository: Repository<TimeLog>,
  ) {}

  async start(task_id: string, user_id: string): Promise<TimeLog> {
    const exist_log = await this.timeLogRepository.findOne({
      where: { task_id, user_id, status: 'in-progress' },
    });

    if (exist_log) {
      throw new NotFoundException(
        `Временная отметка с ID "${exist_log.log_id}" уже начата`,
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

  async stop(time_log_id: string): Promise<TimeLog> {
    const time_log = await this.timeLogRepository.findOne({
      where: { log_id: time_log_id },
    });
    if (!time_log) {
      throw new NotFoundException(
        `Временная отметка с ID "${time_log_id}" не найдена`,
      );
    }
    if (time_log.status === 'completed') {
      throw new NotFoundException(
        `Временная отметка с ID "${time_log_id}" уже завершена`,
      );
    }

    return this.timeLogRepository.save({
      ...time_log,
      status: 'completed',
      end_time: new Date(),
    });
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Необходимо указать ID временной отметки');
    }
    const time_log = await this.timeLogRepository.findOneBy({
      log_id: id,
    });
    if (!time_log) {
      throw new NotFoundException(`Временная отметка с ID "${id}" не найдено`);
    }

    return this.timeLogRepository.findOneBy({ log_id: id });
  }

  async findTimeLogsByTaskId(
    task_id: string,
    user_id: string,
    paginationQuery: PaginationQueryDto,
  ) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [projects, total] = await this.timeLogRepository.findAndCount({
      where: { task_id, user_id },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return [projects, total];
  }

  async remove(time_log_id: string): Promise<void> {
    const result = await this.timeLogRepository.delete(time_log_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Время с ID "${time_log_id}" не найдено`);
    }
  }
}
