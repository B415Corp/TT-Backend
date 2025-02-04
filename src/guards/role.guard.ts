import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '../common/enums/project-role.enum';
import { ProjectSharedService } from 'src/api/project-shared/project-shared.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectMembersService: ProjectSharedService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ProjectRole[]>(
      'roles',
      context.getHandler()
    );
    if (!roles) {
      return true; // Если роли не указаны, доступ разрешен
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user_id; // Предполагается, что ID пользователя хранится в объекте user
    const projectId = request.params.id; // Получаем ID проекта из параметров

    const projectMember = await this.projectMembersService.getUserRoleInProject(
      projectId,
      userId
    );

    // Текущая роль: projectMember.role
    // Необходимая роль: roles
    if (!roles.includes(projectMember.role)) {
      throw new ForbiddenException(
        `У вас нет разрешения на доступ к этому ресурсу. Необходимая роль: ${roles.join(', ')}`
      );
    }

    return true;
  }
}
