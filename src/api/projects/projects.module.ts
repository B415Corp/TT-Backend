import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Currency } from 'src/entities/currency.entity';
import { User } from 'src/entities/user.entity';
import { Tag } from '../../entities/tag.entity';
import { ProjectMember } from '../../entities/project-shared.entity';
import { ProjectSharedModule } from '../project-shared/project-shared.module';
import { GuardsModule } from '../../guards/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Currency, User, Tag, ProjectMember]),
    ProjectSharedModule,
    GuardsModule,
  ],
  providers: [ProjectsService],
  exports: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
