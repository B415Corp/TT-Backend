import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { popularCurrencies } from 'src/common/constants';
import { ProjectRole } from 'src/common/enums/project-role.enum';

export class PatchMembersDto {
  @ApiProperty({ enum: ProjectRole, default: ProjectRole.EXECUTOR })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role?: ProjectRole;

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
