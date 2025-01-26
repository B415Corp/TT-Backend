import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateTagDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    name?: string; // Название тега
} 