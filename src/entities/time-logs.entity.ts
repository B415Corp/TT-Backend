import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TimeLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  log_id: string;

  @Column()
  @ApiProperty({ type: String })
  task_id: string;

  @Column()
  @ApiProperty({ type: String })
  user_id: string;

  @Column()
  @ApiProperty({ type: Date })
  start_time: Date;

  @Column()
  @ApiProperty({ type: Date })
  end_time: Date;

  @Column()
  @ApiProperty({ type: String })
  @Column({ default: 'in-progress' })
  status: 'in-progress' | 'completed';

  @Column()
   @ApiProperty({ type: Number })
  @Column({ default: 0 })
  duration: number;

  @CreateDateColumn()
   @ApiProperty({ type: Date })
  created_at: Date;

  @UpdateDateColumn()
   @ApiProperty({ type: Date })
  updated_at: Date;
}
