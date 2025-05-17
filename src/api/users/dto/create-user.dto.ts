import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength, IsOptional, IsEnum } from 'class-validator';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'alexeykoh@mail.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  readonly email: string;

  @ApiProperty({
    example: '1234567890',
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

  @ApiProperty({
    example: SubscriptionType.FREE,
    description: 'Тип подписки пользователя',
    enum: SubscriptionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionType)
  readonly subscriptionType?: SubscriptionType;
}
