import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { TimeLogsService } from './time_logs.service';
import { TimeLogsController } from './time_logs.controller';
import { TimeLog } from '../../entities/time-logs.entity';
import { User } from '../../entities/user.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeLog, User]), ProjectSharedModule, SubscriptionsModule, PlansModule],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
  controllers: [TimeLogsController],
})
export class TimeLogsModule {}
