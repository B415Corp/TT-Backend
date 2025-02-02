import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember])],
  providers: [ProjectMembersService],
  controllers: [ProjectMembersController],
  exports: [ProjectMembersService],
})
export class ProjectMembersModule {} 