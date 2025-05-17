import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({ type: String, description: 'Дополнительные данные уведомления', nullable: true })
  @Column({ type: 'text', nullable: true })
  data: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @ApiProperty({ type: Date, description: 'Дата создания уведомления' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Дата последнего обновления уведомления' })
  @UpdateDateColumn()
  updated_at: Date;
}
