import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Currency {
  @ApiProperty({
    type: Number,
    description: 'Unique identifier for the currency',
  })
  @PrimaryGeneratedColumn()
  currency_id: number;

  @ApiProperty({ type: String, description: 'Name of the currency' })
  @Column()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'User ID associated with the currency',
  })
  @Column()
  user_id: number;

  @ApiProperty({ type: String, required: false, description: 'Currency code' })
  @Column({ nullable: true })
  code?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Currency symbol',
  })
  @Column({ nullable: true })
  symbol?: string;
}
