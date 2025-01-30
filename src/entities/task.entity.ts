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
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Tag } from './tag.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Task {
  @ApiProperty({ type: String, description: 'Unique identifier for the task' })
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @ApiProperty({ type: String, description: 'Name of the task' })
  @Column()
  name: string;

  @ApiProperty({ type: String, description: 'Project ID associated with the task' })
  @Column()
  project_id: string;

  @ApiProperty({ type: String, description: 'User ID associated with the task' })
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @ApiProperty({ type: String, description: 'Description of the task' })
  @Column('text', { default: '' })
  description: string;

  @ApiProperty({ type: Boolean, description: 'Indicates if the task is paid' })
  @Column()
  is_paid: boolean;

  @ApiProperty({ enum: ['fixed', 'hourly'], description: 'Payment type for the task' })
  @Column({ default: 'hourly' })
  payment_type: 'fixed' | 'hourly';

  @ApiProperty({ type: Number, description: 'Rate for the task' })
  @Column('decimal', { default: 0 })
  rate: number;

  @ApiProperty({ type: Number, description: 'Currency ID associated with the task' })
  @Column({ default: 1 })
  currency_id: number;

  @ApiProperty({ type: Date, description: 'Creation date of the task' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the task' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.tasks)
  user: User;

  @ManyToOne(() => Project, project => project.task)
  project: Project;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'task_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];
}
