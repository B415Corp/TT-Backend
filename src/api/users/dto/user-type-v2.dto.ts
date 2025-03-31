import { ApiProperty } from '@nestjs/swagger';
import { UserTypeDto } from './user-type.dto';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

export class UserTypeV2Dto extends UserTypeDto {
  @ApiProperty({ 
    description: 'Subscription type of the user',
    enum: SubscriptionType,
    example: SubscriptionType.BASIC
  })
  subscriptionType: SubscriptionType;

  @ApiProperty({ 
    description: 'Date when the user was created',
    type: Date,
    example: '2023-01-01T00:00:00.000Z'
  })
  created_at: Date;
}
