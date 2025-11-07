import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from '../entity/customer.entity';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async saveCustomer(customerEntity: CustomerEntity): Promise<void> {
    await this.customerRepository.save(customerEntity);
  }

  async findCustomerByEmail(email: string): Promise<boolean> {
    return await this.customerRepository.exists({
      where: { email },
    });
  }
}
