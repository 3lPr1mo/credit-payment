import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/data.source.options';
import { ProductEntity } from './entity/product.entity';
import { CustomerEntity } from './entity/customer.entity';
import { DeliveryEntity } from './entity/delivery.entity';
import { OrderTransactionEntity } from './entity/oder.transaction.entity';
import { TransactionStatusEntity } from './entity/transaction.status.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([ProductEntity, CustomerEntity, DeliveryEntity, OrderTransactionEntity, TransactionStatusEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
