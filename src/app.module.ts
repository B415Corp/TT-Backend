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
import { PlansModule } from './api/plans/plans.module';
import { SubscriptionsModule } from './api/subscriptions/subscriptions.module';
import { SeederModule } from './seeder.module';
import { FriendshipModule } from './api/friendship/friendship.module';
import { NotificationModule } from './api/notification/notification.module';
import { TaskStatusModule } from './api/task-status/task-status.module';
import { TaskStatusColumnModule } from './api/task-status-column/task-status-column.module';

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
          synchronize: true,
          logging: environment !== 'production' ? ['error'] : false, // Disable logging in production
        };

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
    PlansModule,
    SeederModule,
    SubscriptionsModule,
    FriendshipModule,
    NotificationModule,
    TaskStatusModule,
    TaskStatusColumnModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [],
})
export class AppModule {}
