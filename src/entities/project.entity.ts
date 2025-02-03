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
import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember } from './project-member.entity';

@Entity()
export class Project {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the project',
  })
  @PrimaryGeneratedColumn('uuid')
  project_id: string;

  @ApiProperty({ type: String, description: 'Name of the project' })
  @Column()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Client ID associated with the project',
  })
  @Column({ default: '' })
  client_id: string;

  @ApiProperty({ type: String, description: 'User ID of the project owner' })
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_owner_id: string;

  @ApiProperty({
    type: Number,
    description: 'Currency ID associated with the project',
  })
  @Column({ default: 1 })
  currency_id: number;

  @ApiProperty({ type: Number, description: 'Rate for the project' })
  @Column({ default: 0 })
  rate: number;

  @ApiProperty({ type: Date, description: 'Creation date of the project' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the project' })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @OneToMany(() => Task, (task) => task.project)
  task: Task[];

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'project_tags',
    joinColumn: { name: 'project_id', referencedColumnName: 'project_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => ProjectMember, (member) => member.project, {
    onDelete: 'CASCADE',
  })
  members: ProjectMember[];
}
