import { Injectable } from '@nestjs/common';
import { Currency } from '../../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurrenciesService {
    constructor(
        @InjectRepository(Currency)
        private currenciesRepository: Repository<Currency>,
    ) {}

    create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
        const currency = this.currenciesRepository.create(createCurrencyDto);
        return this.currenciesRepository.save(currency);
    }

    findAll(): Promise<Currency[]> {
        return this.currenciesRepository.find();
    }

    findOne(id: number): Promise<Currency> {
        return this.currenciesRepository.findOneBy({ currency_id: id });
    }

    async update(id: number, updateCurrencyDto: UpdateCurrencyDto): Promise<Currency> {
        await this.currenciesRepository.update(id, updateCurrencyDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.currenciesRepository.delete(id);
    }
} 