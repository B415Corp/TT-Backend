import { ApiProperty } from '@nestjs/swagger';
import { TaskStatusNameDTO } from './task-status-name.dto';

export class CreateTaskStatusDTO {
  @ApiProperty({
    type: () => [TaskStatusNameDTO],
    description: 'Массив статусов задач с порядком следования',
    example: [
      { name: 'TO DO', order: 1 },
      { name: 'IN PROGRESS', order: 2 },
      { name: 'DONE', order: 3 },
    ],
  })
  names: TaskStatusNameDTO[];
}
