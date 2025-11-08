import { Test, TestingModule } from '@nestjs/testing';
import { CustomerUseCase } from './customer.usecase';
import { CustomerPersistencePort } from 'domain/spi/customer.persistence.port';
import { Customer } from 'domain/model/customer.model';
import { CustomerAlreadyExistsException } from 'domain/exception/customer.already.exists.exception';
import { ExceptionConstant } from 'domain/constant/exception.constants';

describe('CustomerUseCase', () => {
  let customerUseCase: CustomerUseCase;
  let customerPersistencePort: jest.Mocked<CustomerPersistencePort>;

  const mockCustomerPersistencePort: CustomerPersistencePort = {
    clientExistsWithEmail: jest.fn(),
    saveClient: jest.fn(),
    findCustomerByEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CustomerUseCase,
          useFactory: () => new CustomerUseCase(mockCustomerPersistencePort),
        },
      ],
    }).compile();

    customerUseCase = module.get<CustomerUseCase>(CustomerUseCase);
    customerPersistencePort = mockCustomerPersistencePort as jest.Mocked<CustomerPersistencePort>;
  });

  describe('createCustomer', () => {
    it('should save customer when customer does not exist', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerPersistencePort, 'clientExistsWithEmail').mockResolvedValue(false);
      jest.spyOn(customerPersistencePort, 'saveClient').mockResolvedValue(customer);

      await customerUseCase.createCustomer(customer);

      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledWith(customer.email);
      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledTimes(1);
      expect(customerPersistencePort.saveClient).toHaveBeenCalledWith(customer);
      expect(customerPersistencePort.saveClient).toHaveBeenCalledTimes(1);
    });

    it('should throw CustomerAlreadyExistsException when customer already exists', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerPersistencePort, 'clientExistsWithEmail').mockResolvedValue(true);

      await expect(customerUseCase.createCustomer(customer)).rejects.toThrow(
        CustomerAlreadyExistsException,
      );
      await expect(customerUseCase.createCustomer(customer)).rejects.toThrow(
        ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE,
      );

      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledWith(customer.email);
      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledTimes(2);
      expect(customerPersistencePort.saveClient).not.toHaveBeenCalled();
    });

    it('should return the saved customer when creation is successful', async () => {
      const customer: Customer = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      const savedCustomer: Customer = {
        ...customer,
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      jest.spyOn(customerPersistencePort, 'clientExistsWithEmail').mockResolvedValue(false);
      jest.spyOn(customerPersistencePort, 'saveClient').mockResolvedValue(savedCustomer);

      const result = await customerUseCase.createCustomer(customer);

      expect(result).toEqual(savedCustomer);
      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledWith(customer.email);
      expect(customerPersistencePort.saveClient).toHaveBeenCalledWith(customer);
    });

    it('should handle customer with different data formats', async () => {
      const customer: Customer = {
        name: 'José María',
        lastName: 'González-Pérez',
        dni: '1234567890',
        phone: '+57 301 234 5678',
        email: 'jose.maria@test-domain.co',
      };

      jest.spyOn(customerPersistencePort, 'clientExistsWithEmail').mockResolvedValue(false);
      jest.spyOn(customerPersistencePort, 'saveClient').mockResolvedValue(customer);

      await customerUseCase.createCustomer(customer);

      expect(customerPersistencePort.clientExistsWithEmail).toHaveBeenCalledWith(customer.email);
      expect(customerPersistencePort.saveClient).toHaveBeenCalledWith(customer);
    });
  });

  describe('findCustomerByEmail', () => {
    it('should return customer when found by email', async () => {
      const email = 'john.doe@example.com';
      const expectedCustomer: Customer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: email,
      };

      jest.spyOn(customerPersistencePort, 'findCustomerByEmail').mockResolvedValue(expectedCustomer);

      const result = await customerUseCase.findCustomerByEmail(email);

      expect(result).toEqual(expectedCustomer);
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledWith(email);
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return customer with different email formats', async () => {
      const email = 'test.user+tag@domain-name.co.uk';
      const expectedCustomer: Customer = {
        id: '456e7890-e12b-34d5-a678-901234567890',
        name: 'Test',
        lastName: 'User',
        dni: '98765432',
        phone: '+44 20 1234 5678',
        email: email,
      };

      jest.spyOn(customerPersistencePort, 'findCustomerByEmail').mockResolvedValue(expectedCustomer);

      const result = await customerUseCase.findCustomerByEmail(email);

      expect(result).toEqual(expectedCustomer);
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle null/undefined return from persistence layer', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(customerPersistencePort, 'findCustomerByEmail').mockResolvedValue(null as any);

      const result = await customerUseCase.findCustomerByEmail(email);

      expect(result).toBeNull();
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledWith(email);
    });

    it('should propagate errors from persistence layer', async () => {
      const email = 'error@example.com';
      const error = new Error('Database connection failed');

      jest.spyOn(customerPersistencePort, 'findCustomerByEmail').mockRejectedValue(error);

      await expect(customerUseCase.findCustomerByEmail(email)).rejects.toThrow('Database connection failed');
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle empty email string', async () => {
      const email = '';

      jest.spyOn(customerPersistencePort, 'findCustomerByEmail').mockResolvedValue(null as any);

      const result = await customerUseCase.findCustomerByEmail(email);

      expect(result).toBeNull();
      expect(customerPersistencePort.findCustomerByEmail).toHaveBeenCalledWith(email);
    });
  });
});
