import { Module } from '@nestjs/common';
import { TaskStatusService } from './task-status.service';
import { TaskStatusController } from './task-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from 'src/guards/guards.module';
import { TaskStatus } from 'src/entities/task-status.entity';
import { TaskStatusColumn } from 'src/entities/task-status-colunt.entity';
import { Task } from 'src/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskStatus, Task, TaskStatusColumn]),
    GuardsModule,
  ],
  providers: [TaskStatusService],
  controllers: [TaskStatusController],
  exports: [TaskStatusService],
})
export class TaskStatusModule {}
