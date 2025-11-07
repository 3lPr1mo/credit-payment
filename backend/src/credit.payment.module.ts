import { Module } from '@nestjs/common';
import { CustomerHandler } from 'application/handler/customer.handler';
import { CustomerUseCase } from 'domain/api/usecase/customer.usecase';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { CustomerAdapter } from './infrastructure/out/postgres/adapter/customer.adapter';
import { CustomerController } from './infrastructure/in/http/controller/customer.controller';
import { CustomerRepository } from './infrastructure/out/postgres/repository/customer.repository';
import { CustomerExceptionHandler } from './infrastructure/in/http/exceptionhandler/customer.exception.handler';
import { ConfigModule } from '@nestjs/config';
import configuration from './infrastructure/out/postgres/config/configuration';
import { DatabaseModule } from './infrastructure/out/postgres/database.module';
import { ProductController } from './infrastructure/in/http/controller/product.controller';
import { ProductHandler } from 'application/handler/product.handler';
import { ProductRepository } from './infrastructure/out/postgres/repository/product.repository';
import { ProductExceptionHandler } from './infrastructure/in/http/exceptionhandler/product.exception.handler';
import { ProductAdapter } from './infrastructure/out/postgres/adapter/product.adapter';
import { ProductPersistencePort } from 'domain/spi/product.persistence.port';
import { ProductUseCase } from 'domain/api/usecase/product.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV || '.env',
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
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
    CustomerHandler,
    CustomerRepository,
    CustomerExceptionHandler,
    {
      provide: 'CustomerPersistencePort',
      useFactory: (customerRepository: CustomerRepository) => {
        return new CustomerAdapter(customerRepository)
      },
      inject: [CustomerRepository]
    },
    {
      provide: 'CustomerUseCase',
      useFactory: (customerPersistencePort: CustomerPersistencePort) => {
        return new CustomerUseCase(customerPersistencePort);
      },
      inject: ['CustomerPersistencePort'],
    },
  ],
  controllers: [ProductController, CustomerController],
})
export class CreditPaymentModule {}
