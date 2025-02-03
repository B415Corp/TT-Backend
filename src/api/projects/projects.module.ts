import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { Tag } from '../../entities/tag.entity';
import { ProjectMember } from '../../entities/project-member.entity';
import { ProjectMembersModule } from '../project-members/project-members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Currency, User, Tag, ProjectMember]),
    ProjectMembersModule,
  ],
  providers: [ProjectsService],
  exports: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
