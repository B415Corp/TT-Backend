import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty()
  name: string;

  @ApiProperty({
    example: 'd086f135-a6a3-45c7-a07b-a2a364e38d90',
  })
  project_id: string;

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
