import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? '.env'
    : process.env.NODE_ENV === 'development'
    ? '.env.dev'
    : '.env',
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: false,
  logging: true,
});
