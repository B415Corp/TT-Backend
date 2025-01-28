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
import { Project } from './project.entity';
import { Tag } from './tag.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  task_id: string;

  @Column()
  name: string;

  @Column()
  project_id: string;

  @Column()
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @Column('text')
  @Column({ default: '' })
  description: string;

  @Column()
  is_paid: boolean;

  @Column()
  @Column({ default: 'hourly' })
  payment_type: 'fixed' | 'hourly';

  @Column('decimal')
  @Column({ default: 0 })
  rate: number;

  @Column('decimal')
  @Column({ default: 1 })
  currency_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.tasks)
  user: User;

  @ManyToOne(() => Project, project => project.project_id)
  project: Project;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'task_tags',
    joinColumn: { name: 'task_id', referencedColumnName: 'task_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];
}
