import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';

@Entity()
export class Client {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the client',
  })
  @PrimaryGeneratedColumn('uuid')
  client_id: string;

  @ApiProperty({
    type: String,
    description: 'User ID associated with the client',
  })
  @Column({ default: '11111111-1111-1111-1111-111111111111' })
  user_id: string;

  @ApiProperty({ type: String, description: 'Name of the client' })
  @Column()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Contact information of the client',
  })
  @Column()
  contact_info: string;

  @ApiProperty({ type: Date, description: 'Creation date of the client' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date, description: 'Last update date of the client' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    type: () => User,
    description: 'User associated with the client',
  })
  @ManyToOne(() => User, (user) => user.clients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Tag, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'client_tags',
    joinColumn: { name: 'client_id', referencedColumnName: 'client_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => Project, (project) => project.client, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  projects: Project[];
}
