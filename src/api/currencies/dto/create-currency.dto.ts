import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ description: 'Name of the currency' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User ID associated with the currency' })
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ required: false, description: 'Currency code' })
  code?: string;

  @ApiProperty({ required: false, description: 'Currency symbol' })
  symbol?: string;
}
