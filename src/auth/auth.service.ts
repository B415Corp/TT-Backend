import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../token/token.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async login(dto: LoginUserDto) {
    const existUser = await this.usersService.findOne(dto.email);
    if (!existUser) {
      throw new BadRequestException('Пользователь не найден');
    }

    const validatePassword = await bcrypt.compare(
      dto.password,
      existUser.password,
    );
    if (!validatePassword) {
      throw new BadRequestException('Неверный пароль');
    }

    const token = await this.tokenService.createToken(dto);

    return { ...existUser, token: token.access_token };
  }
}
