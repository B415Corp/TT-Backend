import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { Plan } from 'src/entities/plan.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PlanSeeder {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async seed() {
    // Получаем валюту USD (предполагаем, что она уже есть в базе)
    const usd = await this.currencyRepository.findOneBy({ code: 'USD' });
    
    if (!usd) {
      throw new Error('Currency USD not found. Seed currencies first!');
    }

    const plans = [
      {
        code: 'free',
        name: 'Free Plan',
        description: 'Basic functionality with limitations',
        price: 0,
        currency: usd,
        billingPeriod: 'month',
        isActive: true,
        features: {
          maxProjects: 1,
          storageGB: 5,
          prioritySupport: false,
        },
        trialDays: null,
      },
      {
        code: 'basic',
        name: 'Basic Plan',
        description: 'For small projects and teams',
        price: 9.99,
        currency: usd,
        billingPeriod: 'month',
        isActive: true,
        features: {
          maxProjects: 5,
          storageGB: 50,
          prioritySupport: false,
        },
        trialDays: 7,
      },
      {
        code: 'premium',
        name: 'Premium Plan',
        description: 'Full access with priority support',
        price: 29.99,
        currency: usd,
        billingPeriod: 'month',
        isActive: true,
        features: {
          maxProjects: 20,
          storageGB: 200,
          prioritySupport: true,
        },
        trialDays: 14,
      },
      // Годовые тарифы (опционально)
      {
        code: 'premium_year',
        name: 'Premium (Yearly)',
        description: 'Premium plan with annual discount',
        price: 299.99, // ~25$/month вместо 29.99$
        currency: usd,
        billingPeriod: 'year',
        isActive: true,
        features: {
          maxProjects: 20,
          storageGB: 200,
          prioritySupport: true,
        },
        trialDays: null,
      },
    ];

    for (const planData of plans) {
        const exists = await this.planRepository.existsBy({ code: planData.code });
        if (!exists) {
          const plan = new Plan();
          Object.assign(plan, {
            ...planData,
            billingPeriod: 'month' as const,
            currency: usd
          });
          await this.planRepository.save(plan);
        }
      }
  }
}