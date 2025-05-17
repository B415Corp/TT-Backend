import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PROJECT_ROLE } from 'src/common/enums/project-role.enum';

export class ProjectFilterDto {
  @ApiPropertyOptional({ enum: ['name', 'created_at'], description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'created_at';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort order' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ enum: PROJECT_ROLE, description: 'Filter by project role' })
  @IsOptional()
  @IsEnum(PROJECT_ROLE)
  role?: PROJECT_ROLE;

  @ApiPropertyOptional({ type: String, description: 'Filter by client ID' })
  @IsOptional()
  @IsString()
  client_id?: string;
}
