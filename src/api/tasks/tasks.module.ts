import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project])],
  providers: [TasksService],
  exports: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
