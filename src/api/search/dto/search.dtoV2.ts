import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SEARCH_LOCATION } from 'src/common/enums/search-location.enum';

export enum SearchSortBy {
  NAME = 'name',
  DATE = 'date',
}

export enum SearchSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchSortItem {
  @ApiProperty({ enum: SearchSortBy, description: 'Поле сортировки: name или date' })
  @IsEnum(SearchSortBy)
  by: SearchSortBy;

  @ApiProperty({ enum: SearchSortOrder, description: 'Порядок сортировки: asc или desc' })
  @IsEnum(SearchSortOrder)
  order: SearchSortOrder;
}

export class SearchDtoV2 {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ enum: SEARCH_LOCATION })
  @IsEnum(SEARCH_LOCATION)
  searchLocation: SEARCH_LOCATION;

  @ApiPropertyOptional({
    type: [SearchSortItem],
    description: 'Массив критериев сортировки. Можно комбинировать несколько критериев для мультисортировки.',
    example: [
      { by: 'date', order: 'asc' },
      { by: 'date', order: 'desc' },
      { by: 'name', order: 'asc' },
      { by: 'name', order: 'desc' },
      // Комбинированные варианты:
      [{ by: 'date', order: 'asc' }, { by: 'name', order: 'asc' }],
      [{ by: 'name', order: 'desc' }, { by: 'date', order: 'desc' }]
    ]
  })
  @IsOptional()
  sort?: SearchSortItem[];
}
