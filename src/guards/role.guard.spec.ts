import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ProjectMembersService } from '../api/project-members/project-members.service';
import { ProjectRole } from '../common/enums/project-role.enum';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let projectMembersService: ProjectMembersService;

  beforeEach(() => {
    projectMembersService = { getUserRoleInProject: jest.fn() } as any;
    roleGuard = new RoleGuard(new Reflector(), projectMembersService);
  });

  it('should allow access if no roles are specified', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    const result = await roleGuard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access if user role does not match', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    projectMembersService.getUserRoleInProject = jest
      .fn()
      .mockResolvedValue({ role: ProjectRole.GUEST });
    const roles = [ProjectRole.OWNER];

    const result = await roleGuard.canActivate(mockContext);
    expect(result).toBe(false);
  });
});
