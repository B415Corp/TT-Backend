import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

export class SubscribeDto {
  @ApiProperty({ enum: SubscriptionType, example: 'free' })
  @IsEnum(SubscriptionType)
  plan: SubscriptionType;
}
