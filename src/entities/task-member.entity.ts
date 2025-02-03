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

@Entity('task_members')
export class TaskMember {
  @ApiProperty({ description: 'Уникальный идентификатор участника задачи' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String, description: 'ID задачи' })
  @Column()
  task_id: string;

  @ApiProperty({ type: String, description: 'ID пользователя' })
  @Column()
  user_id: string;

  // @ManyToOne(() => Task, (task) => task.members)
  // @JoinColumn({ name: 'task_id' })
  // task: Task;

  // @ManyToOne(() => User, (user) => user.taskMembers)
  // @JoinColumn({ name: 'user_id' })
  // user: User;
}
