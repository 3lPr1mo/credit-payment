import { Module } from '@nestjs/common';
import { CustomerHandler } from 'application/handler/customer.handler';
import { CustomerUseCase } from 'domain/api/usecase/customer.usecase';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { CustomerAdapter } from './infrastructure/out/postgres/adapter/customer.adapter';
import { CustomerController } from './infrastructure/in/http/controller/customer.controller';
import { CustomerRepository } from './infrastructure/out/postgres/repository/customer.repository';
import { CustomerExceptionHandler } from './infrastructure/in/http/exceptionhandler/customer.exception.handler';

@Module({
  providers: [
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
  controllers: [CustomerController],
})
export class CreditPaymentModule {}
