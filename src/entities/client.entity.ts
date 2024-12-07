import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  client_id: string;

  @Column()
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @Column()
  name: string;

  @Column()
  contact_info: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
