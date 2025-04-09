import { Controller, Get, Param, UseGuards, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, isArray: true })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(@GetUser() user: User) {
    return this.notificationService.getNotifications(user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async markNotificationAsRead(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(id);
  }
}
