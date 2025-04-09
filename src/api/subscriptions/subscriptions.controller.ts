import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subscribe user',
  })
  @ApiResponse({ status: 200, type: Subscription })
  @UseGuards(JwtAuthGuard)
  @Post('/subscribe')
  async subscribe(
    @GetUser() user: User,
    @Query() subscribeDto: SubscribeDto
  ): Promise<Subscription> {
    return this.subscriptionService.subscribe(user.user_id, subscribeDto.plan);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my subscription',
    description: 'Get user subscription',
  })
  @ApiResponse({ status: 200, type: Subscription })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async search(@GetUser() user: User): Promise<Subscription> {
    return this.subscriptionService.getActiveSubscription(user.user_id);
  }
}
