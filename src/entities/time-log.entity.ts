import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  duration: number;
}
