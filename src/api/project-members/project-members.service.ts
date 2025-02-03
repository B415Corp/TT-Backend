import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ErrorMessages } from '../../common/error-messages';
import { Project } from 'src/entities/project.entity';
import { ProjectRole } from 'src/common/enums/project-role.enum';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async assignRole(
    projectId: string,
    assignRoleDto: AssignRoleDto,
    ownerId: string
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
      const newProjectMember = this.projectMemberRepository.create({
        ...assignRoleDto,
        project_id: projectId,
        approve: false,
      });
      return this.projectMemberRepository.save(newProjectMember);
    }

    projectMember.role = assignRoleDto.role;
    return this.projectMemberRepository.save(projectMember);
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    await this.projectMemberRepository.delete(projectMember.member_id);
  }

  async approveMember(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    projectMember.approve = true;
    return this.projectMemberRepository.save(projectMember);
  }

  async getMembersByApprovalStatus(
    projectId: string,
    approved?: boolean | undefined
  ): Promise<ProjectMember[]> {
    return this.projectMemberRepository.find({
      where: { project_id: projectId, approve: approved },
    });
  }

  async getUserRoleInProject(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId },
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    if (!Object.values(ProjectRole).includes(projectMember.role)) {
      throw new Error('Invalid role found in project member');
    }

    return projectMember;
  }
}
