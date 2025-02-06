import { Module } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { ProjectSharedModule } from '../api/project-shared/project-shared.module';
import { TaskSharedModule } from '../api/task-members/task-shared.module';

@Module({
  imports: [ProjectSharedModule, TaskSharedModule],
  providers: [RoleGuard],
  exports: [RoleGuard],
})
export class GuardsModule {} 