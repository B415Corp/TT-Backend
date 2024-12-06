import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the client' })
  readonly name: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'The contact information of the client',
  })
  readonly contact_info: string;
}
