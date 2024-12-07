import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto, user_id: string): Promise<Client> {
    const client = this.clientRepository.create({ ...dto, user_id });
    return this.clientRepository.save(client);
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Клиент не найден');
    }
    return this.clientRepository.findOneBy({ client_id: id });
  }

  async findByKey(key: keyof Client, value: string) {
    if (!key || !value) {
      throw new Error('Клиент не найден');
    }
    return this.clientRepository.findOneBy({ [key]: value });
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.clientRepository.preload({
      client_id: id,
      ...dto,
    });
    if (!client) {
      throw new NotFoundException(`Клиент с ID "${id}" не найден`);
    }
    return this.clientRepository.save(client);
  }

  async remove(client_id: string): Promise<void> {
    const result = await this.clientRepository.delete(client_id);

    if (result.affected === 0) {
      throw new NotFoundException(`Клиент с ID "${client_id}" не найден`);
    }
  }
}
