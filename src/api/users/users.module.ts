import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PlansModule } from '../plans/plans.module';
import { UsersSeeder } from './users.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Subscription]),
    SubscriptionsModule,
    PlansModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersSeeder],
  exports: [UsersService, UsersSeeder],
})
export class UsersModule {}
