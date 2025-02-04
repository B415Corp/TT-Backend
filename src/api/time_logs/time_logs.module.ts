import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TimeLogsService } from './time_logs.service';
import { TimeLogsController } from './time_logs.controller';
import { TimeLog } from '../../entities/time-logs.entity';
import { ProjectMembersModule } from '../project-members/project-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeLog]), ProjectMembersModule],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
  controllers: [TimeLogsController],
})
export class TimeLogsModule {}
