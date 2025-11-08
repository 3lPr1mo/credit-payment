import { Module } from '@nestjs/common';
import { CustomerUseCase } from 'domain/api/usecase/customer.usecase';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { CustomerAdapter } from './infrastructure/out/postgres/adapter/customer.adapter';
import { CustomerRepository } from './infrastructure/out/postgres/repository/customer.repository';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import configuration from './infrastructure/out/postgres/config/configuration';
import { DatabaseModule } from './infrastructure/out/postgres/database.module';
import { ProductController } from './infrastructure/in/http/controller/product.controller';
import { ProductHandler } from 'application/handler/product.handler';
import { ProductRepository } from './infrastructure/out/postgres/repository/product.repository';
import { ProductExceptionHandler } from './infrastructure/in/http/exceptionhandler/product.exception.handler';
import { ProductAdapter } from './infrastructure/out/postgres/adapter/product.adapter';
import { ProductPersistencePort } from 'domain/spi/product.persistence.port';
import { ProductUseCase } from 'domain/api/usecase/product.usecase';
import { OrderTransactionHandler } from 'application/handler/order.transaction.handler';
import { OrderTransactionRepository } from './infrastructure/out/postgres/repository/order.transaction.repository';
import { OrderTransactionAdapter } from './infrastructure/out/postgres/adapter/order.transaction.adapter';
import { OrderTransactionUseCase } from 'domain/api/usecase/order.transaction.usecase';
import { OrderTransactionPersistencePort } from 'domain/spi/order.transaction.persistence.port';
import { ProductServicePort } from 'domain/api/product.service.port';
import { CustomerServicePort } from 'domain/api/customer.service.port';
import { DeliveryServicePort } from 'domain/api/delivery.service.port';
import { WompiServicePort } from 'domain/spi/wompi.service.port';
import { TransactionStatusPersistencePort } from 'domain/spi/transaction.status.persistence.port';
import { DeliveryRepository } from './infrastructure/out/postgres/repository/delivery.repository';
import { DeliveryAdapter } from './infrastructure/out/postgres/adapter/delivery.adapter';
import { DeliveryPersistencePort } from 'domain/spi/delivery.persistence.port';
import { DeliveryUseCase } from 'domain/api/usecase/delivery.usecase';
import { TransactionStatusRepository } from './infrastructure/out/postgres/repository/transaction.status.repository';
import { TransactionStatusAdapter } from './infrastructure/out/postgres/adapter/transaction.satatus.adapter';
import { WompiClient } from './infrastructure/out/external/wompi/api/wompi.client';
import { WompiServiceAdapter } from './infrastructure/out/external/wompi/adapter/wompi.service.adapter';
import { HttpModule } from '@nestjs/axios';
import { OrderTransactionController } from './infrastructure/in/http/controller/order.transaction.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV || '.env',
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    HttpModule
  ],
  providers: [
    ProductHandler,
    ProductRepository,
    ProductExceptionHandler,
    {
      provide: 'ProductPersistencePort',
      useFactory: (productRepository: ProductRepository) => {
        return new ProductAdapter(productRepository)
      },
      inject: [ProductRepository]
    },
    {
      provide: 'ProductUseCase',
      useFactory: (productPersistencePort: ProductPersistencePort) => {
        return new ProductUseCase(productPersistencePort);
      },
      inject: ['ProductPersistencePort'],
    },
    CustomerRepository,
    {
      provide: 'CustomerPersistencePort',
      useFactory: (customerRepository: CustomerRepository) => {
        return new CustomerAdapter(customerRepository)
      },
      inject: [CustomerRepository]
    },
    {
      provide: 'CustomerServicePort',
      useFactory: (customerPersistencePort: CustomerPersistencePort) => {
        return new CustomerUseCase(customerPersistencePort);
      },
      inject: ['CustomerPersistencePort'],
    },
    OrderTransactionHandler,
    OrderTransactionRepository,
    {
      provide: 'OrderTransactionPersistencePort',
      useFactory: (orderTransactionRepository: OrderTransactionRepository) => {
        return new OrderTransactionAdapter(orderTransactionRepository);
      },
      inject: [OrderTransactionRepository]
    },
    DeliveryRepository,
    {
      provide: 'DeliveryPersistencePort',
      useFactory: (deliveryRepository: DeliveryRepository) => {
        return new DeliveryAdapter(deliveryRepository);
      },
      inject: [DeliveryRepository]
    },
    {
      provide: 'DeliveryServicePort',
      useFactory: (deliveryPersistencePort: DeliveryPersistencePort) => {
        return new DeliveryUseCase(deliveryPersistencePort);
      },
      inject: ['DeliveryPersistencePort']
    },
    TransactionStatusRepository,
    {
      provide: 'TransactionStatusPersistencePort',
      useFactory: (transactionStatusRepository: TransactionStatusRepository) => {
        return new TransactionStatusAdapter(transactionStatusRepository);
      },
      inject: [TransactionStatusRepository]
    },
    WompiClient,
    {
      provide: 'WompiServicePort',
      useFactory: (configService: ConfigType<typeof configuration>, wompiClient: WompiClient) => {
        return new WompiServiceAdapter(configService, wompiClient);
      },
      inject: [configuration.KEY, WompiClient]
    },
    {
      provide: 'OrderTransactionUseCase',
      useFactory: (orderTransactionPersistencePort: OrderTransactionPersistencePort, productServicePort: ProductServicePort, customerServicePort: CustomerServicePort, deliveryServicePort: DeliveryServicePort, transactionStatusPersistencePort: TransactionStatusPersistencePort, wompiServicePort: WompiServicePort) => {
        return new OrderTransactionUseCase(orderTransactionPersistencePort, productServicePort, customerServicePort, deliveryServicePort, transactionStatusPersistencePort, wompiServicePort);
      },
      inject: ['OrderTransactionPersistencePort', 'ProductUseCase', 'CustomerServicePort', 'DeliveryServicePort', 'TransactionStatusPersistencePort', 'WompiServicePort']
    }
  ],
  controllers: [ProductController, OrderTransactionController],
})
export class CreditPaymentModule {}
