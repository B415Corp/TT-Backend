import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendshipStatus } from 'src/common/enums/friendship-status.enum';
import { ErrorMessages } from 'src/common/error-messages';
import { Friendship } from 'src/entities/friend.entity';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  async findAll(user_id: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: { user: { user_id } },
      relations: ['friend'],
    });
  }

  async findOne(id: string, user_id: string): Promise<Friendship> {
    const data = await this.friendshipRepository.findOne({
      where: { friendship_id: id, user: { user_id } },
      relations: ['friend'],
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    return data;
  }

  async create(user_id: string, friend_id: string): Promise<Friendship> {
    const newFriendship = this.friendshipRepository.create({
      user: { user_id },
      friend: { user_id: friend_id },
      status: FriendshipStatus.PENDING,
    });
    return this.friendshipRepository.save(newFriendship);
  }

  async accept(id: string, user_id: string): Promise<Friendship> {
    const data = await this.friendshipRepository.findOne({
      where: { friendship_id: id, user: { user_id } },
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    data.status = FriendshipStatus.ACCEPTED;
    return this.friendshipRepository.save(data);
  }

  async decline(id: string, user_id: string): Promise<Friendship> {
    const data = await this.friendshipRepository.findOne({
      where: { friendship_id: id, user: { user_id } },
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    data.status = FriendshipStatus.DECLINED;
    return this.friendshipRepository.save(data);
  }

  async cancel(id: string, user_id: string): Promise<void> {
    const data = await this.friendshipRepository.findOne({
      where: { friendship_id: id, user: { user_id } },
    });
    if (!data) {
      throw new NotFoundException(ErrorMessages.FRIENDSHIP_NOT_FOUND);
    }
    data.deleted_at = new Date();
    await this.friendshipRepository.save(data);

    // Schedule the deletion of the friendship after 1 day
    this.schedulerRegistry.addTimeout(
      `delete-friendship-${data.friendship_id}`,
      setTimeout(() => {
        this.friendshipRepository.delete(data.friendship_id);
      }, 86400000) // 1 day in milliseconds
    );
  }

  async getFriends(user_id: string): Promise<User[]> {
    const friendships = await this.friendshipRepository.find({
      where: { user: { user_id }, status: FriendshipStatus.ACCEPTED },
      relations: ['friend'],
    });
    return friendships.map((friendship) => friendship.friend);
  }

  async getPendingFriendshipRequests(user_id: string): Promise<Friendship[]> {
    return this.friendshipRepository.find({
      where: { friend: { user_id }, status: FriendshipStatus.PENDING },
      relations: ['user'],
    });
  }
}
