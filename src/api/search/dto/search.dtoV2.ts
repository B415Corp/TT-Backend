import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class SearchDtoV2 {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ enum: ['all', 'projects', 'tasks', 'clients'] })
  @IsEnum(['all', 'projects', 'tasks', 'clients'])
  searchLocation: 'all' | 'projects' | 'tasks' | 'clients';
}