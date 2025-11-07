import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAdapter } from './customer.adapter';
import { CustomerRepository } from '../repository/customer.repository';
import { CustomerEntity } from '../entity/customer.entity';
import { Customer } from 'domain/model/customer.model';

describe('CustomerAdapter', () => {
  let customerAdapter: CustomerAdapter;
  let customerRepository: CustomerRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAdapter,
        {
          provide: CustomerRepository,
          useValue: {
            saveCustomer: jest.fn(),
            findCustomerByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    customerAdapter = module.get<CustomerAdapter>(CustomerAdapter);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
  });

  describe('saveClient', () => {
    it('should convert customer to entity and save it', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue();

      await customerAdapter.saveClient(customer);

      expect(customerRepository.saveCustomer).toHaveBeenCalledTimes(1);
      const savedEntity = (customerRepository.saveCustomer as jest.Mock).mock.calls[0][0];
      expect(savedEntity).toBeInstanceOf(CustomerEntity);
      expect(savedEntity.name).toBe('John');
      expect(savedEntity.lastName).toBe('Doe');
      expect(savedEntity.dni).toBe('12345678');
      expect(savedEntity.phone).toBe('123456789');
      expect(savedEntity.email).toBe('john.doe@example.com');
    });

    it('should map all customer properties to entity', async () => {
      const customer: Customer = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue();

      await customerAdapter.saveClient(customer);

      const savedEntity = (customerRepository.saveCustomer as jest.Mock).mock.calls[0][0];
      expect(savedEntity).toBeInstanceOf(CustomerEntity);
      expect(savedEntity.name).toBe('Jane');
      expect(savedEntity.lastName).toBe('Smith');
      expect(savedEntity.dni).toBe('87654321');
      expect(savedEntity.phone).toBe('987654321');
      expect(savedEntity.email).toBe('jane.smith@example.com');
    });

    it('should return void when saving is successful', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue();

      const result = await customerAdapter.saveClient(customer);

      expect(result).toBeUndefined();
    });
  });

  describe('clientExistsWithEmail', () => {
    it('should return true when customer exists', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(true);

      const result = await customerAdapter.clientExistsWithEmail('john.doe@example.com');

      expect(result).toBe(true);
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return false when customer does not exist', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(false);

      const result = await customerAdapter.clientExistsWithEmail('nonexistent@example.com');

      expect(result).toBe(false);
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });
});
