import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskMembersService } from './task-members.service';
import { TaskMembersController } from './task-members.controller';
import { TaskMember } from '../../entities/task-member.entity';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskMember, Task, User]),
    ProjectSharedModule,
  ],
  providers: [TaskMembersService],
  controllers: [TaskMembersController],
})
export class TaskMembersModule {}
