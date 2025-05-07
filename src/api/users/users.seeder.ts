import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import { UsersService } from './users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class UsersSeeder {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
  ) {}

  async seed() {
    // Создание пользователя с подпиской FREE через UsersService
    await this.usersService.create({
      name: 'Free User',
      email: 'free@example.com',
      password: 'password123',
      subscriptionType: SubscriptionType.FREE,
    });

    // Создание пользователя с подпиской BASIC через UsersService
    await this.usersService.create({
      name: 'Basic User',
      email: 'basic@example.com',
      password: 'password123',
      subscriptionType: SubscriptionType.BASIC,
    });

    // Создание пользователя с подпиской PREMIUM через UsersService
    await this.usersService.create({
      name: 'Premium User',
      email: 'premium@example.com',
      password: 'password123',
      subscriptionType: SubscriptionType.PREMIUM,
    });
  }
}
