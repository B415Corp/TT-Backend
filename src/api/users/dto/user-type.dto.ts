import { ApiProperty } from '@nestjs/swagger';

export class UserTypeDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  user_id: string;

  @ApiProperty({ description: 'Name of the user' })
  name: string;

  @ApiProperty({ description: 'Email of the user' })
  email: string;
}
