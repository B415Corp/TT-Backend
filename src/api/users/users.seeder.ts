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
    const users = [
      {
        name: 'Free User',
        email: 'free@example.com',
        password: 'password123',
        subscriptionType: SubscriptionType.FREE,
      },
      {
        name: 'Basic User',
        email: 'basic@example.com',
        password: 'password123',
        subscriptionType: SubscriptionType.BASIC,
      },
      {
        name: 'Premium User',
        email: 'premium@example.com',
        password: 'password123',
        subscriptionType: SubscriptionType.PREMIUM,
      },
    ];

    for (const user of users) {
      const existing = await this.usersService.findByEmail(user.email);
      if (existing) continue;
      await this.usersService.create(user);
    }
  }
}
