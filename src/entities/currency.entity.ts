import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currency {
    @PrimaryGeneratedColumn()
    currency_id: number;

    @Column()
    name: string;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    code?: string;

    @Column({ nullable: true })
    symbol?: string;
} 