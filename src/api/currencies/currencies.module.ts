import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { Currency } from '../../entities/currency.entity';
import { CurrencySeeder } from './currency.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  controllers: [CurrenciesController],
  providers: [CurrenciesService, CurrencySeeder],
})
export class CurrenciesModule implements OnModuleInit {
  constructor(private readonly currencySeeder: CurrencySeeder) {}

  async onModuleInit() {
    await this.currencySeeder.seed();
  }
}
