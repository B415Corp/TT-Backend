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
import { ErrorMessages } from '../../common/error-messages';
import { SearchUsersDto } from './dto/search-users.dto';
import { ILike } from 'typeorm';
import { UserTypeDto } from './dto/user-type.dto';
import { UserTypeV2Dto } from './dto/user-type-v2.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionType } from 'src/common/enums/subscription-type.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private subscriptionsService: SubscriptionsService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(ErrorMessages.USER_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const { subscriptionType, ...rest } = createUserDto;
    const user = this.usersRepository.create({
      ...rest,
      password: hashedPassword,
      avatar: '',
    });

    const newUser = await this.usersRepository.save(user);
    await this.subscriptionsService.subscribe(
      newUser.user_id,
      subscriptionType ?? SubscriptionType.FREE
    );

    return {
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
    };
  }

  async update(
    user_id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserTypeDto> {
    const user = await this.usersRepository.findOneBy({ user_id });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return {
      user_id: updatedUser.user_id,
      name: updatedUser.name,
      email: updatedUser.email,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(
    id: string
  ): Promise<Pick<User, 'user_id' | 'name' | 'email'> | undefined> {
    const user = await this.usersRepository.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
    const { user_id, name, email } = user;
    return { user_id, name, email };
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

  async findUser(user_id: string): Promise<UserTypeDto | undefined> {
    const user = await this.usersRepository.findOne({
      where: { user_id },
      relations: ['friendships'],
      select: ['user_id', 'name', 'email'],
    });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }
    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    };
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

    // if (!users.length) {
    //   throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    // }

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
      select: ['user_id', 'name', 'email', 'created_at'],
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
