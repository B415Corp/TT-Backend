import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { popularCurrencies } from 'src/common/constants';

@Entity()
export class UpdateProjectDto {
  @ApiProperty({ example: 'Test project' })
  name: string;

  @ApiProperty({ example: popularCurrencies[0].code })
  currency_id: string;

  @ApiProperty({ example: 10 })
  rate: number;
}
