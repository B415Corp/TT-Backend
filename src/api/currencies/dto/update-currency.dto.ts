import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCurrencyDto {
  @ApiProperty({ required: false, description: 'Name of the currency' })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    required: false,
    description: 'User ID associated with the currency',
  })
  @IsOptional()
  @IsNotEmpty()
  user_id?: number;

  @ApiProperty({ required: false, description: 'Currency code' })
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false, description: 'Currency symbol' })
  @IsOptional()
  symbol?: string;
}
