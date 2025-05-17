import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserDto {
  @ApiProperty({ description: 'User ID to assign to the task' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
