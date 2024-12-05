import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto, user_id: string): Promise<Client> {
    console.log({ ...dto, user_id });
    const client = this.clientRepository.create({ ...dto, user_id });
    return this.clientRepository.save(client);
  }

  async findAll() {
    return this.clientRepository.find();
  }

  async findById(id: string) {
    if (!id) {
      throw new Error('Client not found');
    }
    return this.clientRepository.findOneBy({ client_id: id });
  }
}
