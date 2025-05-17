import { ApiProperty } from '@nestjs/swagger';
import { UserTypeDto } from './user-type.dto';

export class UserTypeV2Dto extends UserTypeDto {


  @ApiProperty({ 
    description: 'Date when the user was created',
    type: Date,
    example: '2023-01-01T00:00:00.000Z'
  })
  created_at: Date;
}
