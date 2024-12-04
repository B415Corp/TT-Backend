import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Импортируем UsersModule
import { AuthController } from './auth.controller';
import {JwtStrategy} from "./guards/jwt.strategy";
import {LocalStrategy} from "./guards/local.strategy";

@Module({
  imports: [
    UsersModule, // Импортируем UsersModule для доступа к UsersService
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Убедитесь, что используете безопасное значение
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
