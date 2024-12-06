import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
