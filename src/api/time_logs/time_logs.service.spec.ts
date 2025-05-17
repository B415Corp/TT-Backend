import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeLog } from '../../entities/time-logs.entity';
import { TimeLogsService } from './time_logs.service';

describe('TimeLogsService', () => {
  let service: TimeLogsService;
  let repository: Repository<TimeLog>;

  const mockRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeLogsService,
        {
          provide: getRepositoryToken(TimeLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TimeLogsService>(TimeLogsService);
    repository = module.get<Repository<TimeLog>>(getRepositoryToken(TimeLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('start', () => {
    it('should throw an error if the user already has an in-progress task', async () => {
      mockRepository.findOne.mockResolvedValueOnce({
        user_id: '123',
        status: 'in-progress',
      });

      await expect(service.start('task123', 'user123')).rejects.toThrow(
        new NotFoundException(
          'Пользователь с ID user123 уже имеет начатую задачу'
        )
      );
    });

    it('should create and save a new time log', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null); // No active logs
      mockRepository.create.mockReturnValueOnce({
        task_id: 'task123',
        user_id: 'user123',
      });
      mockRepository.save.mockResolvedValueOnce({
        log_id: 'log123',
        task_id: 'task123',
      });

      const result = await service.start('task123', 'user123');

      expect(mockRepository.create).toHaveBeenCalledWith({
        task_id: 'task123',
        user_id: 'user123',
        start_time: expect.any(Date),
        end_time: expect.any(Date),
        status: 'in-progress',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ log_id: 'log123', task_id: 'task123' });
    });
  });

  describe('stop', () => {
    it('should throw an error if no in-progress time log exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.stop('task123')).rejects.toThrow(
        new NotFoundException(
          'В задаче с ID "task123" нет активной временной отметки'
        )
      );
    });

    it('should update and save the time log as completed', async () => {
      mockRepository.findOne.mockResolvedValueOnce({
        log_id: 'log123',
        task_id: 'task123',
        start_time: new Date(Date.now() - 1000),
        status: 'in-progress',
      });
      mockRepository.save.mockResolvedValueOnce({
        log_id: 'log123',
        status: 'completed',
        duration: 1000,
      });

      const result = await service.stop('task123');

      expect(mockRepository.save).toHaveBeenCalledWith({
        log_id: 'log123',
        task_id: 'task123',
        start_time: expect.any(Date),
        status: 'completed',
        duration: expect.any(Number),
        end_time: expect.any(Date),
      });
      expect(result).toEqual({
        log_id: 'log123',
        status: 'completed',
        duration: 1000,
      });
    });
  });

  describe('findById', () => {
    it('should throw an error if no ID is provided', async () => {
      await expect(service.findById('')).rejects.toThrow(
        new Error('Необходимо указать ID временной отметки')
      );
    });

    it('should throw a NotFoundException if the time log is not found', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(service.findById('log123')).rejects.toThrow(
        new NotFoundException('Временная отметка с ID "log123" не найдено')
      );
    });

    it('should return the time log if found', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce({ log_id: 'log123' });

      const result = await service.findById('log123');

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        log_id: 'log123',
      });
      expect(result).toEqual({ log_id: 'log123' });
    });
  });

  describe('remove', () => {
    it('should throw a NotFoundException if the time log does not exist', async () => {
      mockRepository.delete.mockResolvedValueOnce({ affected: 0 });

      await expect(service.remove('log123')).rejects.toThrow(
        new NotFoundException('Время с ID "log123" не найдено')
      );
    });

    it('should remove the time log successfully', async () => {
      mockRepository.delete.mockResolvedValueOnce({ affected: 1 });

      await service.remove('log123');

      expect(mockRepository.delete).toHaveBeenCalledWith('log123');
    });
  });
});
