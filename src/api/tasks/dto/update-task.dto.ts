import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 0 })
  currency_id: number;
}
