import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';

@Entity({ name: 'friendship' }) // Указываем имя таблицы, если нужно использовать отличное от имени класса
export class Friendship {
  @ApiProperty({ type: String, description: 'UUID пользователя' })
  @PrimaryGeneratedColumn('uuid')
  friendship_id: string;

  @ApiProperty({
    type: String,
    description: 'User ID associated with the friend',
  })
  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @ApiProperty({ type: Date, description: 'Creation date of the Friendship' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update date of the Friendship',
  })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    type: Date,
    description: 'Deletion date of the Friendship',
    nullable: true,
  })
  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, (user) => user.friends, { onDelete: 'CASCADE' })
  recipient: User;
}
