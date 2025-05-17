import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SearchUsersDto {
  @ApiProperty({ description: 'Search term for user name or email' })
  @IsNotEmpty()
  searchTerm: string;
  @ApiProperty({ description: 'Maximum number of results to return', required: false, default: 5 })
  maxResults?: number = 5;

  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  page?: number = 1;
}
