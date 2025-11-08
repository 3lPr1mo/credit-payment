import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from '../entity/customer.entity';
import { Equal, Repository } from 'typeorm';
import { Customer } from 'domain/model/customer.model';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async saveCustomer(customerEntity: CustomerEntity): Promise<CustomerEntity> {
    return await this.customerRepository.save(customerEntity);
  }

  async clientExistsWithEmail(email: string): Promise<boolean> {
    return await this.customerRepository.exists({
      where: { email },
    });
  }

  async findCustomerByEmail(email: string): Promise<CustomerEntity> {
    return await this.customerRepository.findOne({ where: { email } });
  }
}
