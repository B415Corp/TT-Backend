import { Module } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { ProjectSharedModule } from '../api/project-shared/project-shared.module';
import { TaskSharedModule } from '../api/task-members/task-shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { Project } from 'src/entities/project.entity';
import { TaskMember } from 'src/entities/task-shared.entity';
import { Task } from 'src/entities/task.entity';
import { TimeLog } from 'src/entities/time-logs.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [ProjectSharedModule, TypeOrmModule.forFeature([Task])],
  providers: [RoleGuard],
  exports: [RoleGuard],
})
export class GuardsModule {}
