import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskMember } from '../../entities/task-shared.entity';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { ErrorMessages } from '../../common/error-messages';
import { ProjectSharedService } from '../project-shared/project-shared.service';
import { ProjectMember } from 'src/entities/project-shared.entity';

@Injectable()
export class TaskSharedService {
  constructor(
    @InjectRepository(TaskMember)
    private taskMemberRepository: Repository<TaskMember>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private projectMembersService: ProjectSharedService
  ) {}

  async assignUserToTask(taskId: string, userId: string): Promise<TaskMember> {
    const task = await this.taskRepository.findOneBy({ task_id: taskId });
    if (!task) {
      throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND);
    }

    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const existingAssignment = await this.taskMemberRepository.findOne({
      where: { task_id: taskId, user_id: userId },
    });

    if (existingAssignment) {
      throw new ConflictException(ErrorMessages.USER_ALREADY_ASSIGNED);
    }

    const taskMember = this.taskMemberRepository.create({
      task_id: taskId,
      user_id: userId,
    });

    // Получаем роль пользователя в проекте
    const projectMember = await this.projectMembersService.getUserRoleInProject(
      task.project_id,
      userId
    );

    return this.taskMemberRepository.save({ ...taskMember, projectMember });
  }

  async removeUserFromTask(taskId: string, userId: string): Promise<void> {
    const result = await this.taskMemberRepository.delete({
      task_id: taskId,
      user_id: userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.TASK_MEMBER_NOT_FOUND);
    }
  }

  async getUsersAssignedToTask(taskId: string): Promise<TaskMember[]> {
    return this.taskMemberRepository.find({ where: { task_id: taskId } });
  }

  async getUserRoleInTask(
    taskId: string,
    userId: string
  ): Promise<ProjectMember> {
    // Находим задачу
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
}
