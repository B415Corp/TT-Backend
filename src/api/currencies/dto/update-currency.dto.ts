import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCurrencyDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    user_id?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    code?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    symbol?: string;
} 