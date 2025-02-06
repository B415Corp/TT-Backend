import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectMembersController } from '../project-shared/project-shared.controller';
import { ProjectSharedService } from '../project-shared/project-shared.service';

describe('ProjectMembersController', () => {
  let controller: ProjectMembersController;
  let service: ProjectSharedService;

  const mockProjectSharedService = {
    getUserRoleInProject: jest.fn(),
    getMembersByApprovalStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMembersController],
      providers: [
        {
          provide: ProjectSharedService,
          useValue: mockProjectSharedService,
        },
      ],
    }).compile();

    controller = module.get<ProjectMembersController>(ProjectMembersController);
    service = module.get<ProjectSharedService>(ProjectSharedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRole', () => {
    it('should return user role in project', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';
      const expectedRole = { role: 'executor' }; // Ожидаемая роль

      mockProjectSharedService.getUserRoleInProject = jest
        .fn()
        .mockResolvedValue(expectedRole);

      const result = await controller.getUserRole(projectId, userId);
      expect(result).toEqual(expectedRole);
      expect(
        mockProjectSharedService.getUserRoleInProject
      ).toHaveBeenCalledWith(projectId, userId);
    });

    it('should throw NotFoundException if user role not found', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';

      mockProjectSharedService.getUserRoleInProject = jest
        .fn()
        .mockRejectedValue(new NotFoundException('User role not found'));

      await expect(controller.getUserRole(projectId, userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getMembers', () => {
    it('should return project members', async () => {
      const projectId = 'project-id';
      const approved = true;
      const expectedMembers = [{ user_id: 'user1' }, { user_id: 'user2' }]; // Ожидаемые участники

      mockProjectSharedService.getMembersByApprovalStatus = jest
        .fn()
        .mockResolvedValue(expectedMembers);

      const result = await controller.getMembers(projectId, approved);
      expect(result).toEqual(expectedMembers);
      expect(
        mockProjectSharedService.getMembersByApprovalStatus
      ).toHaveBeenCalledWith(projectId, approved);
    });
  });
});
