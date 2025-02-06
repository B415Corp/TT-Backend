import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectRole } from 'src/common/enums/project-role.enum';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectMember } from '../../entities/project-shared.entity';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class ProjectSharedService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) { }

  // Метод assignRole назначает роль участнику проекта.
  async assignRole(
    projectId: string,
    assignRoleDto: AssignRoleDto,
    ownerId: string
  ): Promise<ProjectMember> {
    // Ищем проект по его идентификатору и идентификатору владельца.
    const project = await this.projectRepository.findOne({
      where: {
        project_id: projectId,
        user_owner_id: ownerId,
      },
    });

    // Если проект не найден, выбрасываем исключение.
    if (!project) {
      throw new NotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
    }

    // Ищем существующих участников с заданной ролью.
    const existingMembers = await this.projectMemberRepository.find({
      where: {
        project_id: projectId,
        user_id: assignRoleDto.user_id,
        role: assignRoleDto.role,
      },
    });

    // Если количество участников с этой ролью превышает 2, выбрасываем исключение.
    if (existingMembers.length >= 2) {
      throw new NotFoundException(ErrorMessages.USER_ROLE_LIMIT_EXCEEDED);
    }

    // Ищем участника проекта по его идентификатору.
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: assignRoleDto.user_id },
    });

    // Если участник не найден, создаем нового участника.
    if (!projectMember) {
      const newProjectMember = this.projectMemberRepository.create({
        ...assignRoleDto,
        project_id: projectId,
        approve: false,
      });
      return this.projectMemberRepository.save(newProjectMember);
    }

    // Если участник найден, обновляем его роль.
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

  async patchSharedRole(project_id: string, role: ProjectRole, user_id: string): Promise<ProjectMember> {
    if (role === ProjectRole.OWNER) {
      throw new ForbiddenException('Запрещено менять роль на ' + ProjectRole.OWNER);
    }
    const sharedItem = await this.projectMemberRepository.findOne({
      where: { project_id, user_id },
    });

    if (!sharedItem) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    return this.projectMemberRepository.save(sharedItem);
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
