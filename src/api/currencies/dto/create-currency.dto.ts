import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCurrencyDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    user_id: number;

    @ApiProperty({ required: false })
    code?: string;

    @ApiProperty({ required: false })
    symbol?: string;
} 