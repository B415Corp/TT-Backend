import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ErrorMessages } from '../../common/error-messages';
import { Project } from 'src/entities/project.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async assignRole(
    projectId: string,
    assignRoleDto: AssignRoleDto,
    ownerId: string,
  ): Promise<ProjectMember> {
    const project = await this.projectRepository.findOne({
      where: {
        project_id: projectId,
        user_owner_id: ownerId,
      },
    });

    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }

    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: assignRoleDto.user_id },
    });

    if (!projectMember) {
      console.log('create')
      return this.projectMemberRepository.create(assignRoleDto);
    }
    // throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    projectMember.role = assignRoleDto.role;
    console.log('save')
    return this.projectMemberRepository.save(projectMember);
  }
}
