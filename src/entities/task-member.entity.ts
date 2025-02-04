import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Task } from './task.entity';
import { ProjectRole } from '../common/enums/project-role.enum';

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

  @ApiProperty({
    enum: ProjectRole,
    description: 'Role of the user in the task',
  })
  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.GUEST,
  })
  role: ProjectRole;

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
}
