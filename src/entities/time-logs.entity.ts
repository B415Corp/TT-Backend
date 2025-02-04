import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class TimeLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  log_id: string;

  @Column()
  @ApiProperty({ type: String })
  task_id: string;

  @Column()
  @ApiProperty({ type: String })
  user_id: string;

  @Column()
  @ApiProperty({ type: Date })
  start_time: Date;

  @Column()
  @ApiProperty({ type: Date })
  end_time: Date;

  @Column()
  @ApiProperty({ type: String })
  @Column({ default: 'in-progress' })
  status: 'in-progress' | 'completed';

  @Column()
  @ApiProperty({ type: Number })
  @Column({ default: 0 })
  duration: number;

  @CreateDateColumn()
  @ApiProperty({ type: Date })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ type: Date })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.timeLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Task, (task) => task.timeLogs)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
