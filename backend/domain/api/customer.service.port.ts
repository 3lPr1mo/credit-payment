import { Customer } from 'domain/model/customer.model';

export interface CustomerServicePort {
  createCustomer(customer: Customer): Promise<void>;
}
