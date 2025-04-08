import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../api/users/dto/login-user.dto';
import { UsersService } from '../api/users/users.service';
import { TokenService } from '../token/token.service';
import { ErrorMessages } from '../common/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
  ) {}

  async login(dto: LoginUserDto) {
    const existUser = await this.usersService.findByEmail(dto.email);
    if (!existUser) {
      throw new BadRequestException(ErrorMessages.USER_NOT_FOUND);
    }

    const validatePassword = await bcrypt.compare(
      dto.password,
      existUser.password
    );
    if (!validatePassword) {
      throw new BadRequestException(ErrorMessages.INVALID_PASSWORD);
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
