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
  log_id: string;

  @Column()
  task_id: string;

  @Column()
  user_id: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  @Column({ default: 'in-progress' })
  status: 'in-progress' | 'completed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
