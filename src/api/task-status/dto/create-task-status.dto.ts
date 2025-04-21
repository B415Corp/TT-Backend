import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskStatusDTO {
  @ApiProperty({
    type: String,
    description: 'ID задачи',
    example: 'b1e7c8a2-1234-4cde-9f1a-123456789abc',
  })
  task_id: string;

  @ApiProperty({
    type: String,
    description: 'ID колонки статуса',
    example: 'a2e7c8b1-5678-4cde-9f1a-abcdef123456',
  })
  task_status_column_id: string;
}
