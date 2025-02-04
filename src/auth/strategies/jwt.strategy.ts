import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_CONSTANTS } from '../../common/constants';
import { UsersService } from '../../api/users/users.service';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.SECRET,
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException(ErrorMessages.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
  }
}
