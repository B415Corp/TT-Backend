import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

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

  async findAll(user_id?: string): Promise<User[]> {
    if (user_id) {
      return this.usersRepository.findBy({ user_id });
    }
    return this.usersRepository.find();
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.usersRepository.delete(user_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с ID "${user_id}" не найден`);
    }
  }
}
