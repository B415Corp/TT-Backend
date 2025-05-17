import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true, type: () => [Object] })
  data: T[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number' },
      page: { type: 'number' },
      limit: { type: 'number' },
      totalPages: { type: 'number' },
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
