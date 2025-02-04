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

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project, TimeLog, Currency, User]),
    ProjectSharedModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
