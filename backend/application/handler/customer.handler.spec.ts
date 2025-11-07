import { Test, TestingModule } from '@nestjs/testing';
import { CustomerHandler } from './customer.handler';
import { CustomerServicePort } from '../../domain/api/customer.service.port';
import { CreateCustomerRequest } from '../dto/request/create.customer.request';
import { Customer } from '../../domain/model/customer.model';

describe('CustomerHandler', () => {
  let customerHandler: CustomerHandler;
  let customerServicePort: CustomerServicePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerHandler,
        {
          provide: 'CustomerUseCase',
          useValue: {
            createCustomer: jest.fn(),
          },
        },
      ],
    }).compile();

    customerHandler = module.get<CustomerHandler>(CustomerHandler);
    customerServicePort = module.get<CustomerServicePort>('CustomerUseCase');
  });

  describe('createCustomer', () => {
    it('should map request to customer model and call service', async () => {
      const request: CreateCustomerRequest = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerServicePort, 'createCustomer').mockResolvedValue();

      await customerHandler.createCustomer(request);

      expect(customerServicePort.createCustomer).toHaveBeenCalledTimes(1);
      expect(customerServicePort.createCustomer).toHaveBeenCalledWith({
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      });
    });

    it('should map all fields correctly from request to customer', async () => {
      const request: CreateCustomerRequest = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      jest.spyOn(customerServicePort, 'createCustomer').mockResolvedValue();

      await customerHandler.createCustomer(request);

      const expectedCustomer: Customer = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      expect(customerServicePort.createCustomer).toHaveBeenCalledWith(expectedCustomer);
    });

    it('should return void when customer creation is successful', async () => {
      const request: CreateCustomerRequest = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerServicePort, 'createCustomer').mockResolvedValue();

      const result = await customerHandler.createCustomer(request);

      expect(result).toBeUndefined();
    });
  });
});
