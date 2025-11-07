import { Customer } from 'domain/model/customer.model';

export interface CustomerPersistencePort {
  saveClient(customer: Customer): Promise<void>;
  clientExistsWithEmail(email: string): Promise<boolean>;
}
