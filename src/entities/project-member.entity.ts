import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Project } from './project.entity';
import { ProjectRole } from '../common/enums/project-role.enum';

@Entity('project_members')
export class ProjectMember {
  @ApiProperty({ description: 'Unique identifier for the project member' })
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @ApiProperty({ type: String, description: 'Project ID' })
  @Column()
  project_id: string;

  @ApiProperty({ type: String, description: 'User ID' })
  @Column()
  user_id: string;

  @ApiProperty({
    enum: ProjectRole,
    description: 'Role of the user in the project',
  })
  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.GUEST,
  })
  role: ProjectRole;

  @ApiProperty({ type: Boolean })
  @Column({ default: false })
  approve: boolean;

  @ApiProperty({ type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, (user) => user.projectMembers, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
