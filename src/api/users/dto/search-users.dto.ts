import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SearchUsersDto {
  @ApiProperty({ description: 'Search term for user name or email' })
  @IsNotEmpty()
  searchTerm: string;
}
