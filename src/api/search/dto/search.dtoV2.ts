import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SEARCH_LOCATION } from 'src/common/enums/search-location.enum';

export class SearchDtoV2 {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ enum: SEARCH_LOCATION })
  @IsEnum(SEARCH_LOCATION)
  searchLocation: SEARCH_LOCATION;
}
