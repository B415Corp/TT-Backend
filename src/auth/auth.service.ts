import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../api/users/users.service';
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
    const existUser = await this.usersService.findByEmail(dto.email);
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

    const userData = {
      user_id: existUser.user_id,
      name: existUser.name,
      email: existUser.email,
    };

    const token = await this.tokenService.createToken(userData);

    return { ...userData, token: token.access_token };
  }
}
