import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column()
  name: string;

  @Column()
  project_id: string;

  @Column()
  user_id: string;

  @Column('text')
  description: string;

  @Column()
  is_paid: boolean;

  @Column()
  payment_type: string;

  @Column('decimal')
  rate: number;

  @Column('text', { array: true })
  tags: string[];
}
