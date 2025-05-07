import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectSharedService } from 'src/api/project-shared/project-shared.service';
import { ProjectMember } from 'src/entities/project-shared.entity';
import { Task } from 'src/entities/task.entity';
import { Repository } from 'typeorm';
import { PROJECT_ROLE } from '../common/enums/project-role.enum';
import { ErrorMessages } from '../common/error-messages';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectMembersService: ProjectSharedService,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем требуемые роли
    const requiredRoles = this.reflector.get<PROJECT_ROLE[]>(
      'roles',
      context.getHandler()
    );
    const source = this.reflector.get<string>('source', context.getHandler());

    // Если роли не указаны
    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен
    }

    // Получаем ID пользователя, ID проекта и ID задачи
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user.user_id; // ID пользователя
    const projectId: string =
      request.params.id || request.params.project_id || request.body.project_id; // ID проекта
    const taskId: string =
      request.params.task_id || request.params.taskId || request.body.task_id; // ID задачи

    let member: ProjectMember;

    // Проверка роли в проекте
    if (source === 'project') {
      member = await this.getRoleInProjectShared(projectId, userId);
    } else if (source === 'task') {
      member = await this.getRoleByTask(taskId, userId);
    } else {
      throw new ForbiddenException('Неизвестный источник');
    }

    // Если пользователь не найден
    if (!member) {
      throw new ForbiddenException('Доступ запрещен');
    }

    // Проверка роли
    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        ErrorMessages.ACCESS_FORBIDDEN(requiredRoles.join(', '))
      );
    }

    // Доступ разрешен
    return true;
  }

  async getRoleByTask(taskId: string, userId: string): Promise<ProjectMember> {
    // Находим задачу
    const task = await this.taskRepository.findOne({
      where: { task_id: taskId },
    });

    if (!task) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(taskId));
    }

    // Получаем роль пользователя в проекте
    const projectMember = await this.projectMembersService.getUserRoleInProject(
      task.project_id,
      userId
    );

    if (!projectMember) {
      throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    }

    return projectMember;
  }

  async getRoleInProjectShared(
    projectId: string,
    userId: string
  ): Promise<ProjectMember> {
    const projectShared = await this.projectMemberRepository.findOne({
      where: { project_id: projectId, user_id: userId, approve: true },
    });
    return projectShared;
  }
}
