import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id: string; // Уникальный идентификатор тега

  @Column()
  user_id: string; // Уникальный идентификатор пользователя

  @Column()
  @Column({ unique: true })
  name: string; // Название тега
}
