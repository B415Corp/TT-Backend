import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import { ErrorMessages } from 'src/common/error-messages';
import { Subscription } from 'src/entities/subscription.entity';
import { User } from 'src/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  async findOne(id: string): Promise<Subscription> {
    const data = await this.subscriptionRepository.findOne({
      where: { id },
      select: { user: {} },
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.SUBSCR_NOT_FOUND);
    }
    return data;
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        user: { user_id: userId },
        status: 'active',
        endDate: MoreThan(new Date()),
      },
      relations: ['user'],
      select: { user: {} },
    });
  }

  async subscribe(
    user_id: string,
    plan: SubscriptionType
  ): Promise<Subscription> {
    const currentSubscription = await this.getActiveSubscription(user_id);
    if (currentSubscription) {
      // Если уже есть активная подписка на этот же план — ошибка
      if (currentSubscription.planId === plan) {
        throw new NotFoundException(ErrorMessages.SUBSCR_ALREADY_EXISTS);
      }
      // Иначе отменяем старую и создаём новую
      currentSubscription.status = 'canceled';
      currentSubscription.endDate = new Date();
      await this.subscriptionRepository.save(currentSubscription);
    }

    const user = await this.userRepository.findOneBy({ user_id });

    const newSubscription = this.subscriptionRepository.create();
    newSubscription.planId = plan;
    newSubscription.status = 'active';
    newSubscription.startDate = new Date();
    newSubscription.user = user;
    newSubscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.subscriptionRepository.save(newSubscription);
  }
}
