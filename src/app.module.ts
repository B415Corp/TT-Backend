import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/guards/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
import { ClientsModule } from './api/clients/clients.module';
import { ProjectsModule } from './api/projects/projects.module';
import { TasksModule } from './api/tasks/tasks.module';
import { TimeLogsModule } from './api/time_logs/time_logs.module';
import { CurrenciesModule } from './api/currencies/currencies.module';
import * as process from 'node:process';
import { TagsModule } from './api/tags/tags.module';
import { SearchModule } from './api/search/search.module';
import { ProjectMembersModule } from './api/project-members/project-members.module';
import { TaskMembersModule } from './api/task-members/task-members.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT as unknown as number,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TokenModule,
    ClientsModule,
    ProjectsModule,
    TaskMembersModule,
    TasksModule,
    TimeLogsModule,
    CurrenciesModule,
    TagsModule,
    SearchModule,
    ProjectMembersModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [],
})
export class AppModule {}
