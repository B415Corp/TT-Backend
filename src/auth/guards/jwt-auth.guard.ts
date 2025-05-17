import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException(ErrorMessages.SESSION_EXPIRED);
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.USER_NOT_FOUND);
    }

    return user;
  }
}
