import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRole } from '../common/enums/project-role.enum';
import { ProjectSharedService } from 'src/api/project-shared/project-shared.service';
import { ErrorMessages } from 'src/common/error-messages';
import { TaskMembersService } from 'src/api/task-members/task-shared.service';
import { ProjectMember } from 'src/entities/project-shared.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectMembersService: ProjectSharedService,
    // private taskMembersService: TaskMembersService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<ProjectRole[]>('roles', context.getHandler());
    const source = this.reflector.get<string>('source', context.getHandler());

    console.log(requiredRoles, source)

    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user_id; // Предполагается, что ID пользователя хранится в объекте user
    const projectId = request.params.id || request.body.project_id; // Получаем ID проекта из параметров
    const taskId = request.params.taskId || request.body.task_id;

    let member: ProjectMember;
    if (source === 'project') {
      member = await this.projectMembersService.getUserRoleInProject(projectId, userId);
    } else if (source === 'task') {
      //  В задаче нет метода getUserRoleInTask,  нужно его добавить в TaskMembersService
      throw new ForbiddenException('Неизвестный источник');
    } else {
      throw new ForbiddenException('Неизвестный источник');
    }


    // Текущая роль: projectMember.role
    // Необходимая роль: roles
    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException(
        ErrorMessages.ACCESS_FORBIDDEN(requiredRoles.join(', '))
      );
    }

    return true;
  }
}
