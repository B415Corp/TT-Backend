import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

export class ChangeSubscriptionDto {
  @ApiProperty({ enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType; // New subscription type
}
