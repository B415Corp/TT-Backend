import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  client_id: string;

  @Column()
  @Column({ default: '' })
  user_id: string;

  @Column()
  name: string;

  @Column()
  contact_info: string;
}
