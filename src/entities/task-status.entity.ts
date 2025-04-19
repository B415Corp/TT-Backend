import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';

@Entity()
export class TaskStatus {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the task status',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: () => [{ name: String, order: Number }],
    description: 'Array of task names with their order',
    example: [
      { name: 'TO DO', order: 1 },
      { name: 'IN PROGRESS', order: 2 },
      { name: 'DONE', order: 3 },
    ],
  })
  @Column('jsonb', { default: [] })
  names: Array<{ name: string; order: number }>;

  @ApiProperty({ type: Date, description: 'Creation date of the task' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the task' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Project, (project) => project.taskStatus)
  @JoinColumn()
  project: Project;
}
