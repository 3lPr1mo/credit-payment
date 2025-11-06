import dotenv from 'dotenv';
import path from 'path';
import { ProductEntity } from 'src/infrastructure/out/postgres/entity/product.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config({ path: '.env' });

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [ProductEntity],
  migrations: [path.join(__dirname, '..') + '/migrations/**/*{.ts, .js}'],
  synchronize: false,
  logging: true,
  extra: {
    options: '-c timezone=America/Bogota'
  },
};

export const dataSource = new DataSource(typeOrmConfig);