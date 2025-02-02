import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response.dto';
import { TimeLog } from 'src/entities/time-logs.entity';

export class TimeLogsPaginatedResponse extends PaginatedResponseDto<TimeLog> {
  @ApiProperty({ type: [TimeLog] })
  data: TimeLog[];
}
