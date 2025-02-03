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
    private projectMembersService: ProjectMembersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<ProjectRole[]>('roles', context.getHandler());
    console.log('Roles required:', roles); // Log required roles
    if (!roles) {
      return true; // If no roles are specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user_id; // Assuming user ID is stored in the user object
    const projectId = request.params.id; // Get project ID from parameters
    console.log('User ID:', userId, 'Project ID:', projectId); // Log user and project IDs

    const projectMember = await this.projectMembersService.getUserRoleInProject(projectId, userId);
    console.log('Project Member:', projectMember); // Log the project member details

    if (!roles.includes(projectMember.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
