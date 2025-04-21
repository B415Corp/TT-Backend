import { Module } from '@nestjs/common';
import { TaskStatusService } from './task-status.service';
import { TaskStatusController } from './task-status.controller';
import { Project } from 'src/entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardsModule } from 'src/guards/guards.module';
import { TaskStatus } from 'src/entities/task-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskStatus, Project]), GuardsModule],
  providers: [TaskStatusService],
  controllers: [TaskStatusController],
})
export class TaskStatusModule {}
