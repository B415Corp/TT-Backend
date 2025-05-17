import { Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { popularCurrencies } from 'src/common/constants';

@Entity()
export class CreateProjectDto {
  @ApiProperty({ example: 'Test project' })
  name: string;

  @ApiProperty({ example: popularCurrencies[0].code })
  currency_id: string;

  @ApiProperty({ example: 10 })
  rate: number;

  @ApiProperty({ example: ['tag1', 'tag2'] })
  tag_ids?: string[];

  @ApiProperty({
    example: null,
    description: 'Client ID associated with the project',
    required: false,
  })
  client_id?: string;
}
