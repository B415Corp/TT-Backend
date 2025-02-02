import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class AddUserProjectDto {
  @ApiProperty({
    type: String,
    example: '321e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;
}
