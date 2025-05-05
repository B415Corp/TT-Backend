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
import { ProjectMember } from './project-shared.entity';
import { TaskMember } from './task-shared.entity';
import { TimeLog } from './time-logs.entity';
import { Subscription } from './subscription.entity';
import { Friendship } from './friend.entity';
import { Notification } from './notification.entity';

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

  // @ApiProperty({ enum: SubscriptionType, enumName: 'SubscriptionType' })
  // @Column({ enum: SubscriptionType, default: SubscriptionType.FREE })
  // subscriptionType: SubscriptionType;

  @Column({
    type: String,
    default:
      'https://api.dicebear.com/9.x/thumbs/svg?backgroundColor=000000&mouth=variant2',
  })
  avatar: string;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => Project, (project) => project.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  projects: Project[];

  @OneToMany(() => Task, (task) => task.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tasks: Task[];

  @OneToMany(() => Client, (client) => client.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  clients: Client[];

  @OneToMany(() => ProjectMember, (member) => member.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  projectMembers: ProjectMember[];

  @OneToMany(() => TaskMember, (taskMember) => taskMember.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  taskMembers: TaskMember[];

  @OneToMany(() => TimeLog, (timeLog) => timeLog.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  timeLogs: TimeLog[];

  @OneToMany(() => Friendship, (friendship) => friendship.sender, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  friendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.recipient, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  friends: Friendship[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    onDelete: 'CASCADE',
  })
  notifications: Notification[];
}
