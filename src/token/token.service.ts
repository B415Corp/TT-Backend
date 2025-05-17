import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_CONSTANTS } from '../common/constants';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async createToken(userData: any) {
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

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_CONSTANTS.SECRET,
      });
    } catch (error) {
      return null;
    }
  }
}
