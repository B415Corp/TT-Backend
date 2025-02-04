import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof Error) {
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException(ErrorMessages.SESSION_EXPIRED);
      }
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
      }
    }
    if (err || !user) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
    return user;
  }
}
