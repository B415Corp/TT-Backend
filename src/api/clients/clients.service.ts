import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>
  ) {}

  async create(dto: CreateClientDto, user_id: string): Promise<Client> {
    const client = this.clientRepository.create({ ...dto, user_id });
    return this.clientRepository.save(client);
  }

  async findById(id: string) {
    const client = await this.clientRepository.findOneBy({ client_id: id });
    if (!client) {
      throw new NotFoundException(ErrorMessages.CLIENT_NOT_FOUND(id));
    }
    return client;
  }

  async findByKey(
    key: keyof Client,
    value: string,
    paginationQuery: PaginationQueryDto
  ) {
    if (!key || !value) {
      throw new NotFoundException(ErrorMessages.CLIENT_NOT_FOUND(''));
    }
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [clients, total] = await this.clientRepository.findAndCount({
      where: { [key]: value },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        client_id: true,
        name: true,
        contact_info: true,
      },
    });

    return [clients, total];
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.preload({
      client_id: id,
      ...dto,
    });
    if (!client) {
      throw new NotFoundException(ErrorMessages.CLIENT_NOT_FOUND(id));
    }
    return this.clientRepository.save(client);
  }

  async remove(client_id: string): Promise<void> {
    const result = await this.clientRepository.delete(client_id);

    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.CLIENT_NOT_FOUND(client_id));
    }
  }

  async findByUserIdAndSearchTerm(
    userId: string,
    searchTerm: string,
    maxResults: number,
    offset: number
  ) {
    const whereCondition: any = {
      user_id: userId,
    };

    if (searchTerm) {
      whereCondition.name = ILike(`%${searchTerm}%`);
    }

    return this.clientRepository.find({
      where: whereCondition,
      // relations: ['user'],
      take: maxResults,
      skip: offset,
      order: { created_at: 'DESC' },
      select: {
        client_id: true,
        name: true,
        contact_info: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}
