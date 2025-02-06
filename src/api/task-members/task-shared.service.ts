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
import { ProjectRole } from 'src/common/enums/project-role.enum';

@Injectable()
export class TaskMembersService {
  constructor(
    @InjectRepository(TaskMember)
    private taskMemberRepository: Repository<TaskMember>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

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

    return this.taskMemberRepository.save(taskMember);
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

  async getUserRoleInTask(taskId: string, userId: string): Promise<ProjectRole> {
    // const taskMember = await this.taskMemberRepository.findOne({
    //   where: { task_id: taskId, user_id: userId },
    // });

    // if (!taskMember) {
    //   return null; // Или throw new NotFoundException(...) если нужно выбрасывать исключение
    // }

    // const task = await this.taskRepository.findOneBy({ task_id: taskMember.task_id });
    // if (!task) {
    //   throw new NotFoundException(ErrorMessages.TASK_NOT_FOUND(taskId));
    // }

    // const projectMember = await this.projectMembersService.getProjectMember(task.project_id, userId);
    // if (!projectMember) {
    //   throw new NotFoundException(ErrorMessages.PROJECT_MEMBER_NOT_FOUND);
    // }

    return ProjectRole.EXECUTOR;
  }
}
