import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  planId: string; // Идентификатор тарифа (например, "basic", "premium")

  @Column({
    type: 'enum',
    enum: ['active', 'canceled', 'expired', 'paused'],
    default: 'active',
  })
  status: 'active' | 'canceled' | 'paused'; // Статус подписки

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  //   @Column({ nullable: true })
  //   stripeSubscriptionId: string; // ID подписки в Stripe (если используется)

  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;
}
