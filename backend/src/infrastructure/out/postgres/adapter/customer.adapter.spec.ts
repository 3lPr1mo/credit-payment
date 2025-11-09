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

      const mockEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };
      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue(mockEntity);

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

      const mockEntity = {
        id: '456e7890-e89b-12d3-a456-426614174001',
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };
      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue(mockEntity);

      await customerAdapter.saveClient(customer);

      const savedEntity = (customerRepository.saveCustomer as jest.Mock).mock.calls[0][0];
      expect(savedEntity).toBeInstanceOf(CustomerEntity);
      expect(savedEntity.name).toBe('Jane');
      expect(savedEntity.lastName).toBe('Smith');
      expect(savedEntity.dni).toBe('87654321');
      expect(savedEntity.phone).toBe('987654321');
      expect(savedEntity.email).toBe('jane.smith@example.com');
    });

    it('should return saved customer when saving is successful', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      const savedEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerRepository, 'saveCustomer').mockResolvedValue(savedEntity);

      const result = await customerAdapter.saveClient(customer);

      expect(result).toEqual(savedEntity);
      expect(customerRepository.saveCustomer).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors when saving', async () => {
      const customer: Customer = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      const error = new Error('Database connection failed');
      jest.spyOn(customerRepository, 'saveCustomer').mockRejectedValue(error);

      await expect(customerAdapter.saveClient(customer)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('clientExistsWithEmail', () => {
    it('should return true when customer exists', async () => {
      const mockCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(mockCustomer);

      const result = await customerAdapter.clientExistsWithEmail('john.doe@example.com');

      expect(result).toBe(true);
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return false when customer does not exist', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(null);

      const result = await customerAdapter.clientExistsWithEmail('nonexistent@example.com');

      expect(result).toBe(false);
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });

    it('should return false when customer is undefined', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(undefined);

      const result = await customerAdapter.clientExistsWithEmail('test@example.com');

      expect(result).toBe(false);
    });

    it('should handle repository errors in clientExistsWithEmail', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockRejectedValue(error);

      await expect(
        customerAdapter.clientExistsWithEmail('test@example.com')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('findCustomerByEmail', () => {
    it('should return customer when found', async () => {
      const mockCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(mockCustomer);

      const result = await customerAdapter.findCustomerByEmail('john.doe@example.com');

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(customerRepository.findCustomerByEmail).toHaveBeenCalledTimes(1);
    });

    it('should return customer object with spread operator applied', async () => {
      const mockCustomer = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(mockCustomer);

      const result = await customerAdapter.findCustomerByEmail('jane.smith@example.com');

      expect(result).toEqual(mockCustomer);
      expect(result).not.toBe(mockCustomer); // Should be a different object reference due to spread operator
    });

    it('should return null when customer is not found', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(null);

      const result = await customerAdapter.findCustomerByEmail('nonexistent@example.com');

      expect(result).toEqual({});
    });

    it('should return empty object when customer is undefined', async () => {
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockResolvedValue(undefined);

      const result = await customerAdapter.findCustomerByEmail('test@example.com');

      expect(result).toEqual({});
    });

    it('should handle repository errors in findCustomerByEmail', async () => {
      const error = new Error('Database query failed');
      jest.spyOn(customerRepository, 'findCustomerByEmail').mockRejectedValue(error);

      await expect(
        customerAdapter.findCustomerByEmail('test@example.com')
      ).rejects.toThrow('Database query failed');
    });
  });
});
