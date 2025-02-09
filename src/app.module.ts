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
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): PostgresConnectionOptions => {
        const dbConfig: PostgresConnectionOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
        };

        console.log('Database connection config:', {
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          database: dbConfig.database,
          nodeEnv: configService.get('NODE_ENV'),
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
