import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../api/users/users.module';
import { TokenModule } from '../token/token.module';
import { JWT_CONSTANTS } from '../common/constants';

@Module({
  imports: [
    UsersModule,
    TokenModule,
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
