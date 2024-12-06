import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
