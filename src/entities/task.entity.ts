import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Tag } from './tag.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TimeLog } from './time-logs.entity';
import { Currency } from './currency.entity';
import { TaskMember } from './task-shared.entity';
import { TaskStatus } from './task-status.entity';

@Entity()
export class Task {
  @ApiProperty({ type: String, description: 'Unique identifier for the task' })
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @ApiProperty({ type: String, description: 'Name of the task' })
  @Column({ length: 120 })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Project ID associated with the task',
  })
  @Column()
  project_id: string;

  @ApiProperty({
    type: String,
    description: 'User ID associated with the task',
  })
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @ApiProperty({ type: String, description: 'Description of the task' })
  @Column('text', { default: '' })
  description: string;

  @ApiProperty({ type: Number, description: 'Task order' })
  @Column({ nullable: true })
  order: number;

  @ApiProperty({ type: Boolean, description: 'Indicates if the task is paid' })
  @Column({ default: false })
  is_paid: boolean;

  @ApiProperty({
    enum: ['fixed', 'hourly'],
    description: 'Payment type for the task',
  })
  @Column({ default: 'hourly' })
  payment_type: 'fixed' | 'hourly';

  @ApiProperty({ type: Number, description: 'Rate for the task' })
  @Column('decimal', { default: 0 })
  rate: number;

  @ApiProperty({
    type: Number,
    description: 'Currency ID associated with the task',
  })
  @Column({ default: 1 })
  currency_id: number;

  @ApiProperty({ type: Date, description: 'Creation date of the task' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the task' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'task_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => TimeLog, (timeLog) => timeLog.task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  timeLogs: TimeLog[];

  @ApiProperty({
    type: () => Currency,
    description: 'Currency associated with the task',
  })
  @ManyToOne(() => Currency, (currency) => currency.tasks)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @OneToMany(() => TaskMember, (taskMember) => taskMember.task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  taskMembers: TaskMember[];

  @OneToOne(() => TaskStatus, (taskStatus) => taskStatus.task, {
    nullable: true,
  })
  @JoinColumn({ name: 'task_status_id' })
  taskStatus: TaskStatus;
}
