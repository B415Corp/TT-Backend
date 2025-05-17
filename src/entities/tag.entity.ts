import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Tag {
  @ApiProperty({ type: String, description: 'Unique identifier for the tag' })
  @PrimaryGeneratedColumn('uuid')
  tag_id: string; // Unique identifier for the tag

  @ApiProperty({ type: String, description: 'User ID associated with the tag' })
  @Column()
  user_id: string; // Unique identifier for the user

  @ApiProperty({ type: String, description: 'Name of the tag' })
  @Column({ unique: true })
  name: string; // Name of the tag
}
