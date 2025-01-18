// subscription.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import { SUBSCRIPTION_KEY } from 'src/decorators/subscription.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredSubscriptions = this.reflector.getAllAndOverride<
      SubscriptionType[]
    >(SUBSCRIPTION_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredSubscriptions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredSubscriptions.some(
      (subscription) => user.subscriptionType === subscription,
    );
  }
}
