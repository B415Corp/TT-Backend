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
import { ErrorMessages } from '../../common/error-messages';
import { SearchUsersDto } from './dto/search-users.dto';
import { ILike } from 'typeorm';
import { UserTypeDto } from './dto/user-type.dto';
import { UserTypeV2Dto } from './dto/user-type-v2.dto';
// import { thumbs } from '@dicebear/collection';
// import { createAvatar } from '@dicebear/core';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      avatar: '',
    });

    return this.usersRepository.save(user);
  }

  async update(user_id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(
    id: string
  ): Promise<
    Pick<User, 'user_id' | 'name' | 'email' | 'subscriptionType'> | undefined
  > {
    const user = await this.usersRepository.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
    const { user_id, name, email, subscriptionType } = user;
    return { user_id, name, email, subscriptionType };
  }

  async findAll(
    paginationQuery: PaginationQueryDto
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
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
  }

  async changeSubscription(
    userId: string,
    changeSubscriptionDto: ChangeSubscriptionDto
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    // Check if the provided subscription type is valid
    const validSubscriptionTypes = Object.values(SubscriptionType);
    if (
      !validSubscriptionTypes.includes(changeSubscriptionDto.subscriptionType)
    ) {
      throw new ConflictException(
        ErrorMessages.SUBSCRIPTION_TYPE_NOT_FOUND(
          changeSubscriptionDto.subscriptionType
        )
      );
    }

    user.subscriptionType = changeSubscriptionDto.subscriptionType; // Update subscription type
    return this.usersRepository.save(user);
  }

  async searchUsers(
    searchUsersDto: SearchUsersDto,
    maxResults: number,
    offset: number
  ): Promise<UserTypeDto[]> {
    const { searchTerm } = searchUsersDto;

    const users = await this.usersRepository.find({
      select: ['user_id', 'name', 'email'],
      where: [
        { name: ILike(`%${searchTerm}%`) },
        { email: ILike(`%${searchTerm}%`) },
      ],
      take: maxResults,
      skip: offset,
      order: { created_at: 'DESC' },
    });

    if (!users.length) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return users.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    }));
  }

  /**
   * Расширенный поиск пользователей (версия 2 API)
   * Включает дополнительные возможности по сравнению с базовым поиском
   */
  async enhancedSearchUsers(
    searchUsersDto: SearchUsersDto
  ): Promise<UserTypeV2Dto[]> {
    const { searchTerm } = searchUsersDto;

    // В версии 2 API мы можем добавить дополнительную логику
    // Например, более точный поиск, сортировку, дополнительные фильтры и т.д.
    const users = await this.usersRepository.find({
      select: ['user_id', 'name', 'email', 'subscriptionType', 'created_at'],
      where: [
        { name: ILike(`%${searchTerm}%`) },
        { email: ILike(`%${searchTerm}%`) },
      ],
      order: { created_at: 'DESC' }, // Сортировка по дате создания (новые первыми)
    });

    if (!users.length) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    // Возвращаем расширенную информацию о пользователях
    return users.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      subscriptionType: user.subscriptionType, // Дополнительное поле в v2
      created_at: user.created_at, // Дополнительное поле в v2
    }));
  }

  async showAvatar(): Promise<string> {
    // const avatar = createAvatar(thumbs, {
    //   // ... options
    // });

    // const dataUri = avatar.toDataUri();
    return 'dataUri';
  }
}
