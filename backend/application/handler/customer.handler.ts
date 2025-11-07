import { Inject, Injectable } from '@nestjs/common';
import { CreateCustomerRequest } from 'application/dto/request/create.customer.request';
import { CustomerServicePort } from 'domain/api/customer.service.port';
import { Customer } from 'domain/model/customer.model';

@Injectable()
export class CustomerHandler {
  constructor(
    @Inject('CustomerUseCase') private readonly customerServicePort: CustomerServicePort,
  ) {}

  async createCustomer(request: CreateCustomerRequest): Promise<void> {
    const customer: Customer = {
      name: request.name,
      lastName: request.lastName,
      dni: request.dni,
      phone: request.phone,
      email: request.email,
    };

    return await this.customerServicePort.createCustomer(customer);
  }
}
