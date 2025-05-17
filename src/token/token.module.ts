import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { JWT_CONSTANTS } from '../common/constants';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
