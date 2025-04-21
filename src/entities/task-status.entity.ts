import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { TaskStatusColumn } from './task-status-colunt.entity';

@Entity()
export class TaskStatus {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the task status',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Date, description: 'Creation date of the task' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the task' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, (project) => project.taskStatus)
  @JoinColumn()
  project: Project;

  @ManyToOne(() => TaskStatusColumn, (taskStatusColumn) => taskStatusColumn.taskStatuses, { nullable: true })
  @JoinColumn({ name: 'task_status_column_id' })
  taskStatusColumn: TaskStatusColumn;

  @OneToMany(() => Task, (task) => task.taskStatus)
  tasks: Task[];
}
