import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UpdateProjectDto {
  @ApiProperty({ example: 'Test project' })
  name: string;

  @ApiProperty({ example: 0 })
  currency_id: number;

  @ApiProperty({ example: 10 })
  rate: number;
}
