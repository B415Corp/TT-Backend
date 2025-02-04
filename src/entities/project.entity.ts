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
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Tag } from './tag.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectMember } from './project-member.entity';
import { Client } from './client.entity';
import { Currency } from './currency.entity';

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
    required: false,
  })
  @Column({ nullable: true })
  client_id: string | null;

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

  @ApiProperty({ type: () => User, description: 'User who owns the project' })
  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'user_owner_id' })
  user: User;

  @OneToMany(() => Task, (task) => task.project, { onDelete: 'CASCADE' })
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

  @ApiProperty({
    type: () => Client,
    description: 'Client associated with the project',
  })
  @ManyToOne(() => Client, (client) => client.projects, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ApiProperty({
    type: () => Currency,
    description: 'Currency associated with the project',
  })
  @ManyToOne(() => Currency, (currency) => currency.projects)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;
}
