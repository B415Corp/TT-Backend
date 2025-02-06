import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notes {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the client',
  })
  @PrimaryGeneratedColumn('uuid')
  notes_id: string;

  @ApiProperty({ type: String, description: 'Name of the client' })
  @Column()
  name: string;

  @ApiProperty({
    type: String,
    description: 'User ID associated with the client',
  })
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;


  @ApiProperty({
    type: String,
    description: 'Contact information of the client',
  })
  @Column()
  text_content: string;

  @ApiProperty({ type: Date, description: 'Creation date of the client' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the client' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    type: () => User,
    description: 'User associated with the client',
  })
  @ManyToOne(() => User, (user) => user.clients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
