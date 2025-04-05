import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/common/error-messages';
import { Subscription } from 'src/entities/subscription.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>
  ) {}

  findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  async findOne(id: string): Promise<Subscription> {
    const data = await this.subscriptionRepository.findOneBy({
      id,
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
    });
  }
}
