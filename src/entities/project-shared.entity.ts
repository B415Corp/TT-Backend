import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Project } from './project.entity';
import { PROJECT_ROLE } from '../common/enums/project-role.enum';
import { Currency } from './currency.entity';
import { TaskMember } from './task-shared.entity';

@Entity('project_members')
export class ProjectMember {
  @ApiProperty({ description: 'Unique identifier for the project member' })
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @ApiProperty({ type: String, description: 'Project ID' })
  @Column()
  project_id: string;

  @ApiProperty({ type: String, description: 'User ID' })
  @Column()
  user_id: string;

  @ApiProperty({
    enum: PROJECT_ROLE,
    description: 'Role of the user in the project',
  })
  @Column({
    type: 'enum',
    enum: PROJECT_ROLE,
    default: PROJECT_ROLE.GUEST,
  })
  role: PROJECT_ROLE;

  @ApiProperty({ type: Boolean })
  @Column({ default: false })
  approve: boolean;

  @ApiProperty({
    enum: ['fixed', 'hourly'],
    description: 'Payment type for the task',
  })
  @Column({ default: 'hourly' })
  payment_type: 'fixed' | 'hourly';

  @ApiProperty({ type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({ type: Number, description: 'Rate for the task' })
  @Column('decimal', { default: 0 })
  rate: number;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, (user) => user.projectMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: () => Currency,
    description: 'Currency associated with the task',
  })
  @ManyToOne(() => Currency, (currency) => currency.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @OneToMany(() => TaskMember, (member) => member.member_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskMember' })
  projectMember: TaskMember;
}
