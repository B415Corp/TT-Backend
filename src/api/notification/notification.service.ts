import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './../../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(userId: string, message: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      message,
user: { user_id: userId },
    });
    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
where: { user: { user_id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
const notification = await this.notificationRepository.findOneBy({ id: notificationId });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}
