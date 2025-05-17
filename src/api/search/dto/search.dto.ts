import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty()
  searchTerm: string;
}
