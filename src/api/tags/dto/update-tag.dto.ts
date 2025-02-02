import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ required: false, description: 'Name of the tag' })
  @IsOptional()
  @IsNotEmpty()
  name?: string; // Название тега
}
