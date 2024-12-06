import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  tag_id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;
}
