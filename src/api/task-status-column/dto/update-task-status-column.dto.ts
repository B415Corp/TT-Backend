import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class UpdateTaskStatusColumtDTO {
  @ApiProperty({
    type: Number,
    description: 'Order in list',
    example: 1,
  })
  @Column()
  order: number;

  @ApiProperty({ type: String, description: 'Color of the task status' })
  @Column({ nullable: true })
  color?: string;

  @ApiProperty({
    type: String,
    description: 'Name of the task status',
    example: 'TO DO',
  })
  @Column()
  name: string;
}
