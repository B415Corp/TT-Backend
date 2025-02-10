import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './api/users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/guards/jwt.strategy';
import { TokenModule } from './token/token.module';
import { ClientsModule } from './api/clients/clients.module';
import { ProjectsModule } from './api/projects/projects.module';
import { TasksModule } from './api/tasks/tasks.module';
import { TimeLogsModule } from './api/time_logs/time_logs.module';
import { CurrenciesModule } from './api/currencies/currencies.module';
import { TagsModule } from './api/tags/tags.module';
import { SearchModule } from './api/search/search.module';
import { TaskSharedModule } from './api/task-members/task-shared.module';
import { ProjectSharedModule } from './api/project-shared/project-shared.module';
import { GuardsModule } from './guards/guards.module';
import { NotesModule } from './api/notes/notes.module';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: (() => {
        switch (process.env.NODE_ENV) {
          case 'local':
            return '.env.local';
          case 'development':
            return '.env.dev';
          case 'production':
            return '.env.prod';
          default:
            return '.env';
        }
      })(),
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): PostgresConnectionOptions => {
        const environment = configService.get('NODE_ENV');
        const dbConfig: PostgresConnectionOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: environment === 'local' || environment === 'development', // Only enable synchronize for local development
          logging: environment !== 'production', // Disable logging in production
        };

        console.log('Database connection config:', {
          ...dbConfig,
          host_port: configService.get<number>('PORT'),
        });

        return dbConfig;
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TokenModule,
    ClientsModule,
    GuardsModule,
    ProjectsModule,
    TaskSharedModule,
    TasksModule,
    TimeLogsModule,
    CurrenciesModule,
    TagsModule,
    SearchModule,
    ProjectSharedModule,
    NotesModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [],
})
export class AppModule {}
