import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Task } from './task.entity';
import { ProjectMember } from './project-shared.entity';

@Entity('task_members')
export class TaskMember {
  @ApiProperty({ description: 'Unique identifier for the task member' })
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @ApiProperty({ type: String, description: 'Task ID' })
  @Column()
  task_id: string;

  @ApiProperty({ type: String, description: 'User ID' })
  @Column()
  user_id: string;

  @ManyToOne(() => Task, (task) => task.taskMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User, (user) => user.taskMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ProjectMember, (member) => member.member_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectMember' })
  projectMember: ProjectMember;

  @ApiProperty({ type: Date })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
