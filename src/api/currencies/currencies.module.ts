import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { Currency } from '../../entities/currency.entity';
import { CurrencySeeder } from './currency.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  controllers: [CurrenciesController],
  providers: [CurrenciesService, CurrencySeeder],
  exports: [CurrencySeeder],
})
export class CurrenciesModule {}
