import { Injectable } from '@nestjs/common';
import { Customer } from 'domain/model/customer.model';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { CustomerRepository } from '../repository/customer.repository';
import { CustomerEntity } from '../entity/customer.entity';

@Injectable()
export class CustomerAdapter implements CustomerPersistencePort {
  constructor(private readonly repository: CustomerRepository) {}

  async saveClient(customer: Customer): Promise<void> {
    const customerEntity = new CustomerEntity();
    customerEntity.name = customer.name;
    customerEntity.lastName = customer.lastName;
    customerEntity.dni = customer.dni;
    customerEntity.phone = customer.phone;
    customerEntity.email = customer.email;

    await this.repository.saveCustomer(customerEntity);
  }

  async clientExistsWithEmail(email: string): Promise<boolean> {
    const customer = await this.repository.findCustomerByEmail(email);
    return !!customer;
  }
}
