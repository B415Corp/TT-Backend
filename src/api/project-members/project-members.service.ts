import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ErrorMessages } from '../../common/error-messages';
import { Project } from 'src/entities/project.entity';
import { User } from '../../entities/user.entity';
import { ProjectRole } from 'src/common/enums/project-role.enum';


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

    console.log(projectId, assignRoleDto);
    const projectMember = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: assignRoleDto.user_id },
    });

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    projectMember.role = assignRoleDto.role;
    return this.projectMemberRepository.save(projectMember);
  }

  async createProject(projectData: any, user: User): Promise<Project> {
    const project = await this.projectRepository.save(projectData);

    // Создаем запись в project_members для владельца проекта
    const projectMember = this.projectMemberRepository.create({
      project: project,
      user: user,
      role: ProjectRole.OWNER,
    });
    await this.projectMemberRepository.save(projectMember);

    return project;
  }

  async deleteProject(projectId: string): Promise<void> {
    // Удаляем все записи из project_members, связанные с проектом
    await this.projectMemberRepository.delete({ project: { project_id: projectId } });
    
    // Удаляем проект
    await this.projectRepository.delete(projectId);
  }
}
