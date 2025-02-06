import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '../common/enums/project-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from 'src/entities/project-shared.entity';
import { ErrorMessages } from '../common/error-messages';
import { Task } from 'src/entities/task.entity';
import { ProjectSharedService } from 'src/api/project-shared/project-shared.service';

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
    const requiredRoles = this.reflector.get<ProjectRole[]>(
      'roles',
      context.getHandler()
    );
    const source = this.reflector.get<string>('source', context.getHandler());

    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user_id; // ID пользователя
    const projectId = request.params.id || request.body.project_id; // ID проекта
    const taskId = request.params.task_id || request.body.task_id; // ID задачи

    let member: ProjectMember;

    if (source === 'project') {
      member = await this.getRoleInProjectShared(projectId, userId);
    } else if (source === 'task') {
      console.log('taskId, userId');
      member = await this.getRoleByTask(taskId, userId);
    } else {
      throw new ForbiddenException('Неизвестный источник');
    }

    if (!member) {
      throw new ForbiddenException('Доступ запрещен');
    }

    // Проверка роли
    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        ErrorMessages.ACCESS_FORBIDDEN(requiredRoles.join(', '))
      );
    }

    return true;
  }

  async getRoleByTask(taskId: string, userId: string): Promise<ProjectMember> {
    // Находим задачу
    console.log('getRoleByTask', taskId, userId);
    const task = await this.taskRepository.findOne({
      where: { task_id: taskId },
      select: ['project_id'], // Выбираем только project_id для оптимизации
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
      where: { project_id: projectId, user_id: userId },
    });
    return projectShared;
  }
}
