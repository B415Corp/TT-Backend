import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SubscriptionType } from '../../common/enums/subscription-type.enum.js';
import { User } from '../../entities/user.entity';
import { TimeLogsController } from './time_logs.controller';
import { TimeLogsService } from './time_logs.service';

describe('TimeLogsController', () => {
  let controller: TimeLogsController;

  const mockTimeLogsService = {
    findById: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    findLatestLogInTask: jest.fn(),
    findTimeLogsByTaskId: jest.fn(),
  };

  const mockUser: User = {
    user_id: 'user123',
    email: 'test@example.com',
    password: 'password',
    name: 'kek',
    subscriptionType: SubscriptionType.FREE,
    created_at: undefined,
    updated_at: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeLogsController],
      providers: [
        {
          provide: TimeLogsService,
          useValue: mockTimeLogsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Заглушка для JwtAuthGuard
      .compile();

    controller = module.get<TimeLogsController>(TimeLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getClientById', () => {
    it('should return a time log by ID', async () => {
      const timeLog = { log_id: 'log123' };
      mockTimeLogsService.findById.mockResolvedValue(timeLog);

      const result = await controller.getClientById('log123');

      expect(mockTimeLogsService.findById).toHaveBeenCalledWith('log123');
      expect(result).toEqual(timeLog);
    });

    it('should throw a NotFoundException if time log not found', async () => {
      mockTimeLogsService.findById.mockRejectedValue(
        new NotFoundException('Time log not found')
      );

      await expect(controller.getClientById('log123')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('start', () => {
    it('should start a time log', async () => {
      const timeLog = { log_id: 'log123', task_id: 'task123' };
      mockTimeLogsService.start.mockResolvedValue(timeLog);

      const result = await controller.start('task123', mockUser);

      expect(mockTimeLogsService.start).toHaveBeenCalledWith(
        'task123',
        mockUser.user_id
      );
      expect(result).toEqual(timeLog);
    });
  });

  describe('stop', () => {
    it('should stop a time log', async () => {
      const timeLog = { log_id: 'log123', task_id: 'task123' };
      mockTimeLogsService.stop.mockResolvedValue(timeLog);

      const result = await controller.stop('task123');

      expect(mockTimeLogsService.stop).toHaveBeenCalledWith('task123');
      expect(result).toEqual(timeLog);
    });
  });

  describe('getLatest', () => {
    it('should return the latest time log in a task', async () => {
      const timeLog = { log_id: 'log123', task_id: 'task123' };
      mockTimeLogsService.findLatestLogInTask.mockResolvedValue(timeLog);

      const result = await controller.getLatest('task123', mockUser);

      expect(mockTimeLogsService.findLatestLogInTask).toHaveBeenCalledWith(
        'task123',
        mockUser.user_id
      );
      expect(result).toEqual(timeLog);
    });
  });

  describe('getMe', () => {
    it('should return all time logs for a user in a task', async () => {
      const timeLogs = [{ log_id: 'log123' }, { log_id: 'log124' }];
      const paginationQuery = { page: 1, limit: 10 };
      mockTimeLogsService.findTimeLogsByTaskId.mockResolvedValue([timeLogs, 2]);

      const result = await controller.getMe(
        'task123',
        mockUser,
        paginationQuery
      );

      expect(mockTimeLogsService.findTimeLogsByTaskId).toHaveBeenCalledWith(
        'task123',
        mockUser.user_id,
        paginationQuery
      );
      expect(result).toEqual([timeLogs, 2]);
    });
  });
});
