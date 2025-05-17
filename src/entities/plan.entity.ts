import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Currency } from "./currency.entity";

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;  // Например, "monthly_premium"

  @Column()
  name: string;  // Для отображения ("Премиум (месяц)")

  @Column({ type: 'text', nullable: true })
  description: string;  // Подробности тарифа

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;  // Цена ($10.99)
 
  @Column()
  billingPeriod: 'month' | 'year';  // Период оплаты
  
  @Column({ default: true })
  isActive: boolean;  // Доступен для покупки
  
  @Column({ type: 'json', nullable: true })
  features: {  // Список возможностей
    maxProjects: number;
    storageGB: number;
    prioritySupport: boolean;
  };
  
  // Если есть пробные периоды
  @Column({ nullable: true })
  trialDays: number;  // Например, 14 дней
 
  @ManyToOne(() => Currency, (currency) => currency.plans, { eager: true }) // Автоматически подгружаем валюту
  currency: Currency;  // Валюта, в которой указана цена
}