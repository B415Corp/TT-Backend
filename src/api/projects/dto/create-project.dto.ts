import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CreateProjectDto {
  @ApiProperty({ example: 'Test project' })
  name: string;

  @ApiProperty({ example: 1 })
  currency_id: number;

  @ApiProperty({ example: 10 })
  rate: number;

  @ApiProperty({ example: ['tag1', 'tag2'] })
  tag_ids?: string[];

  @ApiProperty({ description: 'Client ID associated with the project' })
  client_id: string;
}
