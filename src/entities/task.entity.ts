import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column()
  name: string;

  @Column()
  project_id: string;

  @Column()
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @Column('text')
  @Column({ default: '' })
  description: string;

  @Column()
  is_paid: boolean;

  @Column()
  @Column({ default: 'hourly' })
  payment_type: 'fixed' | 'hourly';

  @Column('decimal')
  @Column({ default: 0 })
  rate: number;

  @Column('decimal')
  @Column({ default: 12 })
  currency_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
