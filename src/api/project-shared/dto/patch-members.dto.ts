import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { popularCurrencies } from 'src/common/constants';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';

export class PatchMembersDto {
  @ApiProperty({ enum: PROJECT_ROLE, default: PROJECT_ROLE.EXECUTOR })
  @IsEnum(PROJECT_ROLE)
  @IsNotEmpty()
  role?: PROJECT_ROLE;

  @ApiProperty({ example: 10 })
  rate?: number;

  @ApiProperty({ example: popularCurrencies[0].code })
  currency_id?: string;

  @ApiProperty({
    enum: ['fixed', 'hourly'],
    description: 'Payment type for the task',
  })
  payment_type?: 'fixed' | 'hourly';
}
