import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimeLogDto {
  @ApiProperty()
  start_time: Date;

  @ApiProperty()
  end_time: Date;

  @ApiProperty()
  status: 'in-progress' | 'completed';
}
