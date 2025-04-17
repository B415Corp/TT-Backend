import { Module, OnModuleInit } from '@nestjs/common';
import { CurrenciesModule } from './api/currencies/currencies.module';
import { PlansModule } from './api/plans/plans.module';
import { CurrencySeeder } from './api/currencies/currency.seeder';
import { PlanSeeder } from './api/plans/plan.seeder';

@Module({
  imports: [CurrenciesModule, PlansModule],
  providers: [],
})
export class SeederModule implements OnModuleInit {
  constructor(
    private readonly currencySeeder: CurrencySeeder,
    private readonly planSeeder: PlanSeeder,
  ) {}

  async onModuleInit() {
    await this.currencySeeder.seed();
    await this.planSeeder.seed();
  }
}
