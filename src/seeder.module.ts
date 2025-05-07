import { Module, OnModuleInit } from '@nestjs/common';
import { CurrenciesModule } from './api/currencies/currencies.module';
import { PlansModule } from './api/plans/plans.module';
import { CurrencySeeder } from './api/currencies/currency.seeder';
import { PlanSeeder } from './api/plans/plan.seeder';
import { UsersSeeder } from './api/users/users.seeder';
import { UsersModule } from './api/users/users.module';

@Module({
  imports: [CurrenciesModule, PlansModule, UsersModule],
  providers: [],
})
export class SeederModule implements OnModuleInit {
  constructor(
    private readonly usersSeeder: UsersSeeder,
    private readonly currencySeeder: CurrencySeeder,
    private readonly planSeeder: PlanSeeder
  ) {}

  async onModuleInit() {
    await this.usersSeeder.seed();
    await this.currencySeeder.seed();
    await this.planSeeder.seed();
  }
}
