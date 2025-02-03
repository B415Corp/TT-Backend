import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ProjectMembersService } from '../api/project-members/project-members.service';
import { ProjectRole } from '../common/enums/project-role.enum';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let projectMembersService: ProjectMembersService;

  beforeEach(() => {
    projectMembersService = { getUserRoleInProject: jest.fn() } as any; // Mock service
    roleGuard = new RoleGuard(new Reflector(), projectMembersService);
  });

  it('should allow access if no roles are specified', async () => {
    const context = { switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }) } as ExecutionContext;
    const result = await roleGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access if user role does not match', async () => {
    const context = { switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }) } as ExecutionContext;
    projectMembersService.getUserRoleInProject = jest.fn().mockResolvedValue({ role: ProjectRole.GUEST });
    const roles = [ProjectRole.OWNER];

    const result = await roleGuard.canActivate(context);
    expect(result).toBe(false); // Adjust based on your implementation
  });
}); 