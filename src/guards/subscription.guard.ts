// subscription.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from 'src/api/plans/plans.service';
import { SubscriptionsService } from 'src/api/subscriptions/subscriptions.service';
import { ErrorMessages } from 'src/common/error-messages';

import { SUBSCRIPTION_KEY } from 'src/decorators/subscription.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
    private plansService: PlansService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlanCodes = this.reflector.getAllAndOverride<string[]>(
      SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Если нет требований к подписке - доступ разрешен
    if (!requiredPlanCodes || requiredPlanCodes.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Получаем активную подписку пользователя
    const activeSubscription =
      await this.subscriptionsService.getActiveSubscription(user.id);

    if (!activeSubscription) {
      throw new ForbiddenException(
        `Доступ запрещен: у вас нет активной подписки. Требуется одна из следующих: ${requiredPlanCodes.join(', ')}.`
      );
    }

    // Получаем план подписки
    const userPlan = await this.plansService.findByCode(
      activeSubscription.planId
    );

    // Проверяем, соответствует ли подписка требованиям
    const hasAccess = requiredPlanCodes.includes(userPlan.code);

    if (!hasAccess) {
      throw new ForbiddenException(
        ErrorMessages.ACCESS_DENYED(userPlan.name, requiredPlanCodes)
      );
    }

    return true;
  }
}
