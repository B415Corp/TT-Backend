import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  // @Column('uuid', { array: true })
  // group_ids: string[];
  //
  // @Column()
  // role_id: string;
  //
  // @Column()
  // subscription_level_id: string;
}
