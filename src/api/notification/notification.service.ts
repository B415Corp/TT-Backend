import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './../../entities/notification.entity';
import { NotificationType } from 'src/common/enums/notification-type.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>
  ) {}

  async createNotification(
    userId: string,
    message: string,
    type: NotificationType,
    data?: string
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      message,
      user: { user_id: userId },
      type: type,
      data,
    });
    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { user_id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async readAllNotifications(userId: string): Promise<Notification[]> {
    // 1. Получаем все непрочитанные уведомления пользователя
    const notifications = await this.notificationRepository.find({
      where: { user: { user_id: userId }, isRead: false },
    });

    // 2. Помечаем каждое как прочитанное
    for (const notification of notifications) {
      notification.isRead = true;
      await this.notificationRepository.save(notification);
    }

    // 3. Возвращаем обновлённые уведомления
    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({
      id: notificationId,
    });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
}
