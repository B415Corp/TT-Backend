import { SetMetadata } from "@nestjs/common";

// subscription.decorator.ts
export const SUBSCRIPTION_KEY = 'subscriptionPlans';
export const Subscription = (...plans: string[]) => 
  SetMetadata(SUBSCRIPTION_KEY, plans);