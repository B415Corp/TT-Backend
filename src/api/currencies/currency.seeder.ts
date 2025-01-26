import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../entities/currency.entity';

export const popularCurrencies = [
    { code: 'USD', name: 'Доллар США', symbol: '$' },
    { code: 'EUR', name: 'Евро', symbol: '€' },
    { code: 'JPY', name: 'Японская иена', symbol: '¥' },
    { code: 'GBP', name: 'Британский фунт стерлингов', symbol: '£' },
    { code: 'AUD', name: 'Австралийский доллар', symbol: 'A$' },
    { code: 'CAD', name: 'Канадский доллар', symbol: 'C$' },
    { code: 'CHF', name: 'Швейцарский франк', symbol: 'CHF' },
    { code: 'CNY', name: 'Китайский юань', symbol: '¥' },
    { code: 'HKD', name: 'Гонконгский доллар', symbol: 'HK$' },
    { code: 'NZD', name: 'Новозеландский доллар', symbol: 'NZ$' },
    { code: 'RUB', name: 'Российский рубль', symbol: '₽' },
];

@Injectable()
export class CurrencySeeder {
    constructor(
        @InjectRepository(Currency)
        private readonly currencyRepository: Repository<Currency>,
    ) {}

    async seed() {
        const existingCurrencies = await this.currencyRepository.find();
        if (existingCurrencies.length === 0) {
            const currencies = popularCurrencies.map(currency => ({
                name: currency.name,
                user_id: 1,
                code: currency.code,
                symbol: currency.symbol,
            }));
            await this.currencyRepository.save(currencies);
        }
    }
} 