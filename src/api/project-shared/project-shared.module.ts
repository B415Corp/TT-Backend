import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../../entities/project-shared.entity';
import { ProjectSharedService } from './project-shared.service';
import { ProjectMembersController } from './project-shared.controller';
import { Project } from 'src/entities/project.entity';
import { Task } from 'src/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember, Project, Task])],
  providers: [ProjectSharedService],
  controllers: [ProjectMembersController],
  exports: [ProjectSharedService, TypeOrmModule.forFeature([ProjectMember])],
})
export class ProjectSharedModule {}
