import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UpdateProjectDto {
    @ApiProperty({ example: 'Test project' })
    name: string;
  
    @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'] })
    user_ids: string[];

    @ApiProperty({ example: 0 })
    currency_id: number;

    @ApiProperty({ example: 10 })
    rate: number;
}
