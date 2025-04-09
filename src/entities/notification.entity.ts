import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, user => user.notifications)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}