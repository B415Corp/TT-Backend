import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { Project } from 'src/entities/project.entity';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember, Project])],
  providers: [ProjectMembersService, RoleGuard],
  controllers: [ProjectMembersController],
  exports: [ProjectMembersService],
})
export class ProjectMembersModule {}
