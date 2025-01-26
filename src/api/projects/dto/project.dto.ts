import { ApiProperty } from '@nestjs/swagger';
import { Entity } from 'typeorm';

@Entity()
export class ProjectDto {
  @ApiProperty({ example: 'Test project' })
  name: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
  user_ids: string[];
}
