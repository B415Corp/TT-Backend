import { Injectable, NotFoundException } from '@nestjs/common';
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
    const exist_user_log = await this.timeLogRepository.findOne({
      where: { user_id, status: 'in-progress' },
    });
    console.log('exist_user_log', exist_user_log);

    if (exist_user_log) {
      throw new NotFoundException(
        `Пользователь с ID ${user_id} уже имеет начатую задачу`,
      );
    }

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

  async stop(task_id: string): Promise<TimeLog> {
    const time_log = await this.timeLogRepository.findOne({
      where: { task_id, status: 'in-progress' },
    });
    if (!time_log) {
      throw new NotFoundException(
        `В задаче с ID "${task_id}" нет активной временной отметки`,
      );
    }
    if (time_log.status === 'completed') {
      throw new NotFoundException(
        `Временная отметка в задаче с ID "${task_id}" уже завершена`,
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
      throw new Error('Необходимо указать ID временной отметки');
    }
    const time_log = await this.timeLogRepository.findOneBy({
      log_id: id,
    });
    if (!time_log) {
      throw new NotFoundException(`Временная отметка с ID "${id}" не найдено`);
    }

    return time_log; // Возвращаем найденный time_log
  }

  async findTimeLogsByTaskId(
    task_id: string,
    user_id: string,
    paginationQuery: PaginationQueryDto,
  ) {
    const { page, limit } = paginationQuery;
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

    return [projects, total];
  }

  async findLatestLogInTask(task_id: string, user_id: string) {
    return this.timeLogRepository.findOne({
      where: { task_id, user_id },
      order: { created_at: 'DESC' },
    });
  }

  async remove(time_log_id: string): Promise<void> {
    const result = await this.timeLogRepository.delete(time_log_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Время с ID "${time_log_id}" не найдено`);
    }
  }
}
