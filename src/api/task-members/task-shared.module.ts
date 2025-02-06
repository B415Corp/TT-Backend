import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskMembersService } from './task-shared.service';
import { TaskMembersController } from './task-shared.controller';
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
  providers: [TaskMembersService],
  controllers: [TaskMembersController],
})
export class TaskMembersModule {}
