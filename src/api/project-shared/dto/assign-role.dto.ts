import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PROJECT_ROLE } from '../../../common/enums/project-role.enum';
import { popularCurrencies } from 'src/common/constants';

export class AssignRoleDto {
  @ApiProperty({ enum: PROJECT_ROLE, default: PROJECT_ROLE.EXECUTOR })
  @IsEnum(PROJECT_ROLE)
  @IsNotEmpty()
  role: PROJECT_ROLE;

  @ApiProperty({ description: 'User ID to assign the role' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ example: 10 })
  rate: number;

  @ApiProperty({ example: popularCurrencies[0].code })
  currency_id: string;
}
