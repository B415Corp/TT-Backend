import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../entities/currency.entity';
import { popularCurrencies } from 'src/common/constants';



@Injectable()
export class CurrencySeeder {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>
  ) {}

  async seed() {
    const existingCurrencies = await this.currencyRepository.find();
    if (existingCurrencies.length === 0) {
      const currencies = popularCurrencies.map((currency) => ({
        name: currency.name,
        user_id: 1,
        code: currency.code,
        symbol: currency.symbol,
      }));
      await this.currencyRepository.save(currencies);
    }
  }
}
