import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateNotesDto {
  @ApiProperty({ example: 'New note', description: 'The name of the note' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Text-content of note' })
  @IsString()
  text_content: string;
}
