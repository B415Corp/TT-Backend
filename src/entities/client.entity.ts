import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

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

  @ManyToOne(() => User, user => user.clients)
  user: User;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'client_tags',
    joinColumn: { name: 'client_id', referencedColumnName: 'client_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];
}
