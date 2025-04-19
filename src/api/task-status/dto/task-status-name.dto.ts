import { ApiProperty } from '@nestjs/swagger';

export class TaskStatusNameDTO {
  @ApiProperty({ description: 'Название статуса задачи', example: 'TO DO' })
  name: string;

  @ApiProperty({ description: 'Порядок следования', example: 1 })
  order: number;
}
