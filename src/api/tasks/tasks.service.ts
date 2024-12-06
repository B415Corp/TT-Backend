import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { CreateTaskDto } from '../../dto/create-task.dto';
import { Project } from '../../entities/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(
    dto: CreateTaskDto,
    user_id: string,
    project_id: string,
  ): Promise<Task> {
    console.log(dto, user_id, project_id);
    const project = await this.projectRepository.findOne({
      where: { project_id },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${project_id}" not found`);
    }

    const task = this.taskRepository.create({
      ...dto,
      project_id,
      user_id,
    });
    return this.taskRepository.save(task);
  }

  async findAll() {
    return this.taskRepository.find();
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Task not found');
    }
    const task = await this.taskRepository.findOneBy({ task_id: id });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return this.taskRepository.findOneBy({ task_id: id });
  }

  async findByKey(key: keyof Task, value: string) {
    if (!value || !key) {
      throw new Error('Task not found');
    }
    const task = await this.taskRepository.find({ [key]: value });

    return this.taskRepository.find({ [key]: value });
  }

  async update(id: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskRepository.preload({
      task_id: id,
      ...dto,
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return this.taskRepository.save(task);
  }

  async remove(task_id: string): Promise<void> {
    const result = await this.taskRepository.delete(task_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${task_id}" not found`);
    }
  }
}
