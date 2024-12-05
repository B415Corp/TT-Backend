import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'example@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  readonly email: string;

  @ApiProperty({
    example: 'strongPassword123!',
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов' })
  @Matches(/[A-Z]/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву',
  })
  @Matches(/[a-z]/, {
    message: 'Пароль должен содержать хотя бы одну строчную букву',
  })
  @Matches(/\d/, { message: 'Пароль должен содержать хотя бы одну цифру' })
  @Matches(/[\W_]/, {
    message: 'Пароль должен содержать хотя бы один специальный символ',
  })
  readonly password: string;

  // @ApiPropertyOptional({
  //   example: '2',
  //   description: 'The role ID of the user',
  // })
  // @IsString()
  // @IsOptional()
  // readonly role_id: string = '2';
  //
  // @ApiPropertyOptional({
  //   example: '1',
  //   description: 'The subscription level ID of the user',
  // })
  // @IsString()
  // @IsOptional()
  // readonly subscription_level_id: string = '1';
}
