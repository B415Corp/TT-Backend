import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskSharedService } from './task-shared.service';
import { TaskSharedController } from './task-shared.controller';
import { TaskMember } from '../../entities/task-shared.entity';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';
import { ProjectSharedService } from '../project-shared/project-shared.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskMember, Task, User]),
    ProjectSharedModule,
  ],
  providers: [TaskSharedService],
  controllers: [TaskSharedController],
  exports: [TaskSharedService],
})
export class TaskSharedModule {}
