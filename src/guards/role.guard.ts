import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectMembersService } from '../api/project-members/project-members.service';
import { ProjectRole } from '../common/enums/project-role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectMembersService: ProjectMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ProjectRole[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Если роли не указаны, разрешаем доступ
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user_id; // Предполагаем, что ID пользователя хранится в объекте user
    const projectId = request.params.id; // Получаем ID проекта из параметров

    const projectMember = await this.projectMembersService.getUserRoleInProject(projectId, userId);

    if (!roles.includes(projectMember.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
} 