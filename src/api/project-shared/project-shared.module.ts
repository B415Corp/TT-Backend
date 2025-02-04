import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../../entities/project-shared.entity';
import { ProjectSharedService } from './project-shared.service';
import { ProjectMembersController } from './project-shared.controller';
import { Project } from 'src/entities/project.entity';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember, Project])],
  providers: [ProjectSharedService, RoleGuard],
  controllers: [ProjectMembersController],
  exports: [ProjectSharedService],
})
export class ProjectSharedModule {}
