import { Module, OnModuleInit } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PlanSeeder } from './plan.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plan.entity';
import { Currency } from 'src/entities/currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Currency]), // Добавляем Currency в forFeature
  ],
  providers: [PlanSeeder, PlansService],
  controllers: [PlansController],
  exports: [PlansService],
})
export class PlansModule implements OnModuleInit {
  constructor(private readonly planSeeder: PlanSeeder) {}

  async onModuleInit() {
    await this.planSeeder.seed();
  }
}
