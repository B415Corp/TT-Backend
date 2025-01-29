import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  tag_id: string; // Unique identifier for the tag

  @Column()
  user_id: string; // Unique identifier for the user

  @Column({ unique: true })
  name: string; // Name of the tag
}
