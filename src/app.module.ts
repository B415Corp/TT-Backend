import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {JwtModule} from "@nestjs/jwt";
import {AuthService} from "./auth/auth.service";
import {JwtStrategy} from "./auth/guards/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'yourusername',
      password: 'GvXWmzMLP03HNmrp',
      database: 'nestdb',
      autoLoadEntities: true,
      synchronize: true,
    }),
    JwtModule.register({
      secret: 'SECRET_KEY', // Замените на более безопасное значение
      signOptions: { expiresIn: '60m' },
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AppModule {}
