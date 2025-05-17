import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';
import { ErrorMessages } from 'src/common/error-messages';
import { Friendship } from 'src/entities/friend.entity';
import { Repository } from 'typeorm';
// import { User } from 'src/entities/user.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { FindFriendshipDto } from './dto/find-friendship.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private schedulerRegistry: SchedulerRegistry,
    private notificationService: NotificationService
  ) {}

  async findAll(user_id: string) {
    const data = await this.friendshipRepository.find({
      where: [{ sender: { user_id } }, { recipient: { user_id } }],
      relations: ['recipient', 'sender'],
      select: {
        friendship_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        recipient: {
          user_id: true,
          name: true,
          email: true,
        },
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });

    const results = data.map((friendship) => {
      return friendship.sender.user_id === user_id
        ? friendship.recipient
        : friendship.sender;
    });

    return results;
  }

  async findOne(id: string, user_id: string): Promise<Friendship> {
    const data = await this.friendshipRepository.findOne({
      where: { friendship_id: id, sender: { user_id } },
      relations: ['recipient'],
      select: {
        friendship_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    return data;
  }

  async findByUserId(user_id: string, me_id: string): Promise<Friendship> {
    const data = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { user_id: user_id },
          recipient: { user_id: me_id },
        },
        {
          sender: { user_id: me_id },
          recipient: { user_id: user_id },
        },
      ],
      relations: ['recipient', 'sender'],
      select: {
        friendship_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
        recipient: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });
    if (!data) {
      return null;
    }
    return data;
  }

  async create(
    sender_id: string,
    recipient_id: string,
    sender_name: string
  ): Promise<Friendship> {
    // Проверяем, не отправляет ли пользователь запрос самому себе
    if (recipient_id === sender_id) {
      throw new ConflictException(ErrorMessages.FRIENDSHIP_SELF);
    }

    // Проверяем, не существует ли уже запрос на дружбу между этими пользователями в любом направлении
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { user_id: sender_id },
          recipient: { user_id: recipient_id },
        },
        {
          sender: { user_id: recipient_id },
          recipient: { user_id: sender_id },
        },
      ],
    });

    // Если запрос уже существует, обрабатываем ситуацию в зависимости от статуса
    if (existingFriendship) {
      // Если запрос на дружбу уже отправлен и находится в состоянии "в ожидании"
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new ConflictException(ErrorMessages.FRIENDSHIP_INVITE_EXIST);
      }
      // Если дружба уже подтверждена или отклонена
      throw new ConflictException(ErrorMessages.FRIENDSHIP_EXIST);
    }

    // Создаем новый запрос на дружбу
    const newFriendship = this.friendshipRepository.create({
      sender: { user_id: sender_id },
      recipient: { user_id: recipient_id },
      status: FriendshipStatus.PENDING,
    });

    // Сохраняем новый запрос на дружбу в базе данных
    const savedFriendship = await this.friendshipRepository.save(newFriendship);

    // Запланировать удаление запроса на дружбу через 1 день, если он не будет принят
    this.schedulerRegistry.addTimeout(
      `delete-friendship-${savedFriendship.friendship_id}`,
      setTimeout(() => {
        this.friendshipRepository.delete(savedFriendship.friendship_id);
      }, 86400000) // 1 день в миллисекундах
    );

    // Создаем уведомление для получателя запроса на дружбу
    await this.notificationService.createNotification(
      recipient_id,
      `Пользователь {${sender_name}:${sender_id}} отправил вам заявку в друзья`,
      NotificationType.FRIENDSHIP_INVITATION,
      JSON.stringify(savedFriendship)
    );

    return savedFriendship;
  }

  async accept(friendship_id: string, user_id: string): Promise<Friendship> {
    // Получаем запрос на дружбу по идентификатору
    const friendship = await this.friendshipRepository.findOne({
      where: { friendship_id: friendship_id },
      relations: ['sender', 'recipient'],
    });

    // Проверяем, существует ли запрос на дружбу
    if (!friendship) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }

    // Проверяем, что текущий пользователь является получателем запроса на дружбу
    if (friendship.recipient.user_id !== user_id) {
      throw new ConflictException(ErrorMessages.FRIENDSHIP_NOT_RECEIVER);
    }

    // Проверяем, что статус запроса на дружбу является "в ожидании"
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictException(ErrorMessages.FRIENDSHIP_ALREADY_HANDLED);
    }

    // Обновляем статус запроса на дружбу на "принято"
    friendship.status = FriendshipStatus.ACCEPTED;

    // Создаем уведомление для отправителя о том, что их заявка была принята
    await this.notificationService.createNotification(
      friendship.sender.user_id,
      `Пользователь {${friendship.recipient.name}:${friendship.recipient.user_id}} принял вашу заявку в друзья`,
      NotificationType.FRIENDSHIP_INVITATION_ACCEPTED
    );

    // Сохраняем обновленный запрос на дружбу в базе данных
    return this.friendshipRepository.save(friendship);
  }

  async decline(id: string): Promise<Friendship> {
    // Получаем запрос на дружбу по идентификатору
    const friendship = await this.friendshipRepository.findOne({
      where: { friendship_id: id },
      relations: ['sender', 'recipient'],
    });

    // Проверяем, существует ли запрос на дружбу
    if (!friendship) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }

    // Проверяем, что статус запроса на дружбу является "в ожидании"
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictException(ErrorMessages.FRIENDSHIP_ALREADY_HANDLED);
    }

    // Обновляем статус запроса на дружбу на "отклонено"
    friendship.status = FriendshipStatus.DECLINED;

    // Создаем уведомление для отправителя о том, что их заявка была отклонена
    await this.notificationService.createNotification(
      friendship.sender.user_id,
      `Пользователь {${friendship.recipient.name}:${friendship.recipient.user_id}} отклонил вашу заявку в друзья`,
      NotificationType.FRIENDSHIP_INVITATION_DECLINED
    );

    // Сохраняем обновленный запрос на дружбу в базе данных
    return this.friendshipRepository.save(friendship);
  }

  async cancel(id: string, user_id: string): Promise<void> {
    const data = await this.friendshipRepository.findOne({
      where: [
        { friendship_id: id, sender: { user_id } },
        { friendship_id: id, recipient: { user_id } },
      ],
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    data.deleted_at = new Date();
    await this.friendshipRepository.save(data);

    // Получаем запрос на дружбу по идентификатору
    const friendship = await this.friendshipRepository.findOne({
      where: { friendship_id: id },
      relations: ['sender', 'recipient'],
    });

    // Создаем уведомление для отправителя о том, что пользователь отказался в дружбе
    await this.notificationService.createNotification(
      user_id === friendship.sender.user_id
        ? friendship.recipient.user_id
        : friendship.sender.user_id,
      `Пользователь {${friendship.recipient.name}:${friendship.recipient.user_id}} отклонил вашу заявку в друзья`,
      NotificationType.FRIENDSHIP_INVITATION_DECLINED
    );

    // Schedule the deletion of the friendship after 1 day
    this.schedulerRegistry.addTimeout(
      `delete-friendship-${data.friendship_id}`,
      setTimeout(() => {
        this.friendshipRepository.delete(data.friendship_id);
      }, 86400000) // 1 day in milliseconds
    );
  }

  async getFriends(user_id: string, paginationQuery: FindFriendshipDto) {
    const { page, limit, status } = paginationQuery;
    const skip = (page - 1) * limit;

    // Базовые условия: дружба, где пользователь - отправитель или получатель
    const baseWhere = [{ sender: { user_id } }, { recipient: { user_id } }];

    // Добавляем фильтрацию по статусу, если он указан
    const where = status
      ? baseWhere.map((condition) => ({
          ...condition,
          status,
        }))
      : baseWhere;

    const [friendships, total] = await this.friendshipRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'ASC' },
      relations: ['sender', 'recipient'],
      select: {
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
        recipient: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });

    return [friendships, total];
  }

  async invitedFriends(user_id: string) {
    // Получаем все дружбы, где пользователь - отправитель или получатель, и статус ACCEPTED
    const friendships = await this.friendshipRepository.find({
      where: [
        { recipient: { user_id }, status: FriendshipStatus.ACCEPTED },
        { sender: { user_id }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['sender', 'recipient'],
      select: {
        friendship_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
        recipient: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });

    // Формируем список друзей, исключая самого пользователя
    const friends = friendships.map((friendship) => {
      // Если текущий пользователь - отправитель, то друг - получатель
      if (friendship.sender.user_id === user_id) {
        return {
          friendship_id: friendship.friendship_id,
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
          friend: {
            user_id: friendship.recipient.user_id,
            name: friendship.recipient.name,
            email: friendship.recipient.email,
          },
        };
      } else {
        // Иначе друг - отправитель
        return {
          friendship_id: friendship.friendship_id,
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
          friend: {
            user_id: friendship.sender.user_id,
            name: friendship.sender.name,
            email: friendship.sender.email,
          },
        };
      }
    });

    return friends;
  }

  async getPendingFriendshipRequests(user_id: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: { recipient: { user_id }, status: FriendshipStatus.PENDING },
      relations: ['sender'],
      select: {
        friendship_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        sender: {
          user_id: true,
          name: true,
          email: true,
        },
      },
    });
  }
}
