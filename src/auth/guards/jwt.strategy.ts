import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY', // Это секретный ключ для подписи и верификации токена. Убедитесь, что он хранится в безопасном месте в реальном проекте
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
