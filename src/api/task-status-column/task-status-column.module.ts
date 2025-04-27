import { Module } from '@nestjs/common';
import { TaskStatusColumnService } from './task-status-column.service';
import { TaskStatusColumnController } from './task-status-column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { TaskStatus } from 'src/entities/task-status.entity';
import { GuardsModule } from 'src/guards/guards.module';
import { TaskStatusColumn } from 'src/entities/task-status-colunt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskStatusColumn, TaskStatus, Project]),
    GuardsModule,
  ],
  providers: [TaskStatusColumnService],
  controllers: [TaskStatusColumnController],
  exports: [TaskStatusColumnService],
})
export class TaskStatusColumnModule {}
