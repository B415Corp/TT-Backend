import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TimeLogsService } from './time_logs.service';
import { TimeLogsController } from './time_logs.controller';
import { TimeLog } from '../../entities/time-logs.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeLog]), ProjectSharedModule],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
  controllers: [TimeLogsController],
})
export class TimeLogsModule {}
