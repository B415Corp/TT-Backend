import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_CONSTANTS } from '../common/constants';
import { UserData } from './interfaces/user-data.interface';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async createToken(userData: UserData) {
    const payload = {
      email: userData.email,
      sub: userData.user_id,
      name: userData.name,
    };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: JWT_CONSTANTS.SECRET,
        expiresIn: JWT_CONSTANTS.EXPIRES_IN,
      }),
    };
  }

  async createRefreshToken(userData: UserData) {
    const payload = {
      email: userData.email,
      sub: userData.user_id,
    };

    return {
      refresh_token: this.jwtService.sign(payload, {
        secret: JWT_CONSTANTS.REFRESH_SECRET,
        expiresIn: JWT_CONSTANTS.REFRESH_EXPIRES_IN,
      }),
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_CONSTANTS.REFRESH_SECRET,
      });
    } catch {
      return null;
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_CONSTANTS.SECRET,
      });
    } catch {
      return null;
    }
  }
}
