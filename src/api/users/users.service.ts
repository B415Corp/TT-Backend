import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeSubscriptionDto } from './dto/change-subscription.dto';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async update(user_id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(user_id: string): Promise<User | undefined> {
    if (!user_id) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.usersRepository.findOneBy({ user_id });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<[User[], number]> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [projects, total] = await this.usersRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return [projects, total];
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.usersRepository.delete(user_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID '${user_id}' не найден`);
    }
  }

  async changeSubscription(userId: string, changeSubscriptionDto: ChangeSubscriptionDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if the provided subscription type is valid
    const validSubscriptionTypes = Object.values(SubscriptionType);
    if (!validSubscriptionTypes.includes(changeSubscriptionDto.subscriptionType)) {
      throw new ConflictException(`Subscription type "${changeSubscriptionDto.subscriptionType}" does not exist`);
    }

    user.subscriptionType = changeSubscriptionDto.subscriptionType; // Update subscription type
    return this.usersRepository.save(user);
  }
}
