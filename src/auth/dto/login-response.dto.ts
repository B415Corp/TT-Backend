import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  user_id: string;

  @ApiProperty({ description: 'Name of the user' })
  name: string;

  @ApiProperty({ description: 'Email of the user' })
  email: string;

  @ApiProperty({ description: 'Subscription type of the user' })
  subscriptionType: string;

  @ApiProperty({ description: 'JWT token for authentication' })
  token: string;
}
