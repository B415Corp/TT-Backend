import { Module } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { ProjectSharedModule } from '../api/project-shared/project-shared.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from 'src/entities/task.entity';

@Module({
  imports: [ProjectSharedModule, TypeOrmModule.forFeature([Task])],
  providers: [RoleGuard],
  exports: [RoleGuard],
})
export class GuardsModule {}
