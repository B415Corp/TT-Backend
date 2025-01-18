import { SubscriptionType } from 'src/common/enums/subscription-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' }) // Указываем имя таблицы, если нужно использовать отличное от имени класса
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string; // Уникальный идентификатор пользователя

  @Column({ length: 100 }) // Ограничение длины имени для оптимизации базы данных
  name: string;

  @Column({ unique: true }) // Email должен быть уникальным
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE, // Значение по умолчанию
  })
  subscriptionType: SubscriptionType;

  @CreateDateColumn({ type: 'timestamp with time zone' }) // Использование временной зоны для совместимости с разными регионами
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' }) // Аналогично для даты обновления
  updated_at: Date;
}
