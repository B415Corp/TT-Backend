// subscription.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

export const SUBSCRIPTION_KEY = 'subscription';
export const Subscription = (...subscriptions: SubscriptionType[]) => {
  return SetMetadata(SUBSCRIPTION_KEY, subscriptions);
};
