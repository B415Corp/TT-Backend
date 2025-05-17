import { ApiProperty } from '@nestjs/swagger';

export class TaskOrderItemDTO {
  @ApiProperty({ type: String, description: 'ID задачи' })
  task_id: string;

  @ApiProperty({ type: Number, description: 'Порядок задачи (order)' })
  order: number;
}

export class UpdateTaskOrderDTO {
  @ApiProperty({
    type: String,
    description: 'Project ID associated with the tasks',
  })
  project_id: string;

  @ApiProperty({
    type: String,
    description: 'Column (task status column) ID associated with the tasks',
  })
  column_id: string;

  @ApiProperty({
    type: [TaskOrderItemDTO],
    description: 'Массив объектов с task_id и order',
  })
  task_orders: TaskOrderItemDTO[];
}
