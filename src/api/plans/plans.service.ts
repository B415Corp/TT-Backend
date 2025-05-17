import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/common/error-messages';
import { Plan } from 'src/entities/plan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>
  ) {}

  async getAll() {
    return this.plansRepository.find();
  }

  async getById(id: number) {
    const currency = await this.plansRepository.findOneBy({ id });
    if (!currency) {
      throw new NotFoundException(ErrorMessages.PLAN_NOT_FOUND);
    }
    return currency;
  }

  async findByCode(code: string): Promise<Plan> {
    const plan = await this.plansRepository.findOneBy({ code });
    if (!plan) {
      throw new NotFoundException(ErrorMessages.PLAN_NOT_FOUND);
    }
    return plan;
  }
}
