import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Plan } from './plan.entity';
import { ProjectMember } from './project-shared.entity';

@Entity()
export class Currency {
  @ApiProperty({
    type: Number,
    description: 'Unique identifier for the currency',
  })
  @PrimaryGeneratedColumn()
  currency_id: number;

  @ApiProperty({ type: String, description: 'Name of the currency' })
  @Column()
  name: string;

  @ApiProperty({ type: String, required: false, description: 'Currency code' })
  @Column({ nullable: true })
  code?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Currency symbol',
  })
  @Column({ nullable: true })
  symbol?: string;

  @OneToMany(() => Project, (project) => project.currency, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  projects: Project[];

  @OneToMany(() => Task, (task) => task.currency, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tasks: Task[];

  // Связь с тарифами (Plan)
  @OneToMany(() => Plan, (plan) => plan.currency)
  plans: Plan[]; // Теперь TypeORM "видит" это свойство

  @ApiProperty({
    type: () => Currency,
    description: 'Currency associated with the task',
  })
  @OneToMany(() => ProjectMember, (projectMember) => projectMember.member_id)
  @JoinColumn({ name: 'member_id' })
  currency: ProjectMember;
}
