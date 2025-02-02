import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectRole } from '../../../common/enums/project-role.enum';

export class AssignRoleDto {
    @ApiProperty({ enum: ProjectRole })
    @IsEnum(ProjectRole)
    @IsNotEmpty()
    role: ProjectRole;

    @ApiProperty({ description: 'User ID to assign the role' })
    @IsNotEmpty()
    user_id: string;
} 