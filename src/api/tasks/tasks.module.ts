import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { TimeLog } from '../../entities/time-logs.entity';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';
import { TaskMember } from '../../entities/task-shared.entity';
import { GuardsModule } from '../../guards/guards.module';
import { TaskStatusModule } from '../task-status/task-status.module';
import { TaskStatusColumnModule } from '../task-status-column/task-status-column.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Project,
      TimeLog,
      Currency,
      User,
      TaskMember,
    ]),
    ProjectSharedModule,
    TaskStatusModule,
    TaskStatusColumnModule,
    GuardsModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
