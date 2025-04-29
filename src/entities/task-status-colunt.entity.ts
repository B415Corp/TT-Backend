import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { TaskStatus } from './task-status.entity';

@Entity()
export class TaskStatusColumn {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the task status',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: Number,
    description: 'Order in list',
    example: 1,
  })
  @Column()
  order: number;

  @ApiProperty({ type: String, description: 'Color of the task status' })
  @Column({ nullable: true })
  color?: string

  @ApiProperty({ type: String, description: 'Name of the task status' })
  @Column()
  name: string;

  @ApiProperty({ type: Date, description: 'Creation date of the task' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the task' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, (project) => project.taskStatus, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: Project;

  @OneToMany(() => TaskStatus, (taskStatus) => taskStatus.taskStatusColumn)
  taskStatuses: TaskStatus[];
}
