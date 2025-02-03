import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Client } from './client.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember } from './project-member.entity';
import { TaskMember } from './task-member.entity';

@Entity({ name: 'users' }) // Указываем имя таблицы, если нужно использовать отличное от имени класса
export class User {
  @ApiProperty({ type: String, description: 'UUID пользователя' })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @ApiProperty({ type: String })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ type: String })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ type: String })
  @Column()
  password: string;

  @ApiProperty({ enum: SubscriptionType, enumName: 'SubscriptionType' })
  @Column({ enum: SubscriptionType, default: SubscriptionType.FREE })
  subscriptionType: SubscriptionType;

  @ApiProperty({ type: Date })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMembers: ProjectMember[];

  // @OneToMany(() => TaskMember, (taskMember) => taskMember.user)
  // taskMembers: TaskMember[];
}
