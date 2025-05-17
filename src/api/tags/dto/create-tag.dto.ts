import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Name of the tag' })
  @IsNotEmpty()
  name: string; // Название тега
}
