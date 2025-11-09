import { Customer } from 'domain/model/customer.model';

export interface CustomerPersistencePort {
  saveClient(customer: Customer): Promise<Customer>;
  clientExistsWithEmail(email: string): Promise<boolean>;
  findCustomerByEmail(email: string): Promise<Customer>;
}
