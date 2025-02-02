import { Injectable, NotFoundException } from '@nestjs/common';
import { Currency } from '../../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private currenciesRepository: Repository<Currency>
  ) {}

  create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currenciesRepository.create(createCurrencyDto);
    return this.currenciesRepository.save(currency);
  }

  findAll(): Promise<Currency[]> {
    return this.currenciesRepository.find();
  }

  async findOne(id: number): Promise<Currency> {
    const currency = await this.currenciesRepository.findOneBy({
      currency_id: id,
    });
    if (!currency) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }
    return currency;
  }

  async update(
    id: number,
    updateCurrencyDto: UpdateCurrencyDto
  ): Promise<Currency> {
    const result = await this.currenciesRepository.update(
      id,
      updateCurrencyDto
    );
    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.currenciesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(ErrorMessages.CURRENCY_NOT_FOUND);
    }
  }
}
