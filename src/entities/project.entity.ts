import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Tag } from './tag.entity';

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
  @Column({ default: 1 })
  currency_id: number;

  @Column()
  @Column({ default: 0 })
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.projects)
  user: User;

  @OneToMany(() => Task, task => task.project_id)
  task: Task;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'project_tags',
    joinColumn: { name: 'project_id', referencedColumnName: 'project_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];
}
