import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Импортируем UsersModule
import { AuthController } from './auth.controller';
import { JwtStrategy } from './guards/jwt.strategy';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [UsersModule, PassportModule, TokenModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
