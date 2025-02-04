import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProjectRole } from '../../../common/enums/project-role.enum';

export class AssignRoleDto {
  @ApiProperty({ enum: ProjectRole, default: ProjectRole.EXECUTOR })
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;

  @ApiProperty({ description: 'User ID to assign the role' })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
