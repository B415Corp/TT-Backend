import { ApiProperty } from '@nestjs/swagger';
import { popularCurrencies } from 'src/common/constants';

export class UpdateTaskDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  is_paid: boolean;

  @ApiProperty({
    enum: ['fixed', 'hourly'],
    example: 'hourly',
  })
  payment_type: 'fixed' | 'hourly';

  @ApiProperty()
  rate: number;

  @ApiProperty({ example: popularCurrencies[0].code })
  currency_id: string;
}
