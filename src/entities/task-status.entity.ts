import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
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

  @ManyToOne(
    () => TaskStatusColumn,
    (taskStatusColumn) => taskStatusColumn.taskStatuses,
    { nullable: true }
  )
  @JoinColumn({ name: 'task_status_column_id' })
  taskStatusColumn: TaskStatusColumn;

  @OneToOne(() => Task, (task) => task.taskStatus)
  task: Task;
}
