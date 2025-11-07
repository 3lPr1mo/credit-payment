import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/data.source.options';
import { ProductEntity } from './entity/product.entity';
import { CustomerEntity } from './entity/customer.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([ProductEntity, CustomerEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
