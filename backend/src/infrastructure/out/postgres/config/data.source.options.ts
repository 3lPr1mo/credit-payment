import dotenv from 'dotenv';
import path from 'path';
import { CustomerEntity } from '../entity/customer.entity';
import { ProductEntity } from '../entity/product.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DeliveryEntity } from '../entity/delivery.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { OrderTransactionEntity } from '../entity/oder.transaction.entity';

dotenv.config({ path: '.env' });

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [ProductEntity, CustomerEntity, DeliveryEntity, TransactionStatusEntity, OrderTransactionEntity],
  migrations: [path.join(__dirname, '../migrations/*.{js,ts}')],
  synchronize: false,
  logging: true,
  extra: {
    options: '-c timezone=America/Bogota',
  },
  ssl: {
    rejectUnauthorized: false,
  }
};

export const dataSource = new DataSource(typeOrmConfig);
