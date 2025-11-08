import { Customer } from 'domain/model/customer.model';
import { CustomerServicePort } from '../customer.service.port';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { CustomerAlreadyExistsException } from 'domain/exception/customer.already.exists.exception';
import { ExceptionConstant } from 'domain/constant/exception.constants';

export class CustomerUseCase implements CustomerServicePort {
  constructor(private readonly customerPersistencePort: CustomerPersistencePort) {}

  async createCustomer(customer: Customer): Promise<Customer> {
    console.log("customer====", customer);
    const clientExists = await this.customerPersistencePort.clientExistsWithEmail(customer.email);
    if (clientExists) {
      throw new CustomerAlreadyExistsException(ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE);
    }
    return await this.customerPersistencePort.saveClient(customer);
  }

  async findCustomerByEmail(email: string): Promise<Customer> {
    const customer = await this.customerPersistencePort.findCustomerByEmail(email);
    return customer;
  }
}
