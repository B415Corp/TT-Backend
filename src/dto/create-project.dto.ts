import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

@Entity()
export class CreateProjectDto {
  @ApiProperty({ example: 'Test project' })
  @Column()
  name: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  @Column('text', { array: true })
  user_ids: string[];
}
