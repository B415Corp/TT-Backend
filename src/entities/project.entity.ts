import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  project_id: string;

  @Column()
  name: string;

  @Column()
  @Column({ default: '' })
  client_id: string;

  @Column('text', { array: true })
  user_ids: string[];

  @Column()
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_owner_id: string;

  @Column()
  @Column({ default: 12 })
  currency_id: number;

  @Column()
  @Column({ default: 0 })
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
