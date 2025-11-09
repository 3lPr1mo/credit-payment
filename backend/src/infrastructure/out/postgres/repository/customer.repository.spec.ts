import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepository } from './customer.repository';
import { CustomerEntity } from '../entity/customer.entity';

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let repository: Repository<CustomerEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: getRepositoryToken(CustomerEntity),
          useValue: {
            save: jest.fn(),
            exists: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    repository = module.get<Repository<CustomerEntity>>(getRepositoryToken(CustomerEntity));
  });

  describe('saveCustomer', () => {
    it('should call save method with customer entity', async () => {
      const customerEntity: CustomerEntity = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(repository, 'save').mockResolvedValue(customerEntity as any);

      await customerRepository.saveCustomer(customerEntity);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(customerEntity);
    });

    it('should return the saved customer entity', async () => {
      const customerEntity: CustomerEntity = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(repository, 'save').mockResolvedValue(customerEntity as any);

      const result = await customerRepository.saveCustomer(customerEntity);

      expect(result).toEqual(customerEntity);
    });

    it('should throw error when save fails', async () => {
      const customerEntity: CustomerEntity = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      const error = new Error('Database error');
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(customerRepository.saveCustomer(customerEntity)).rejects.toThrow('Database error');
    });
  });

  describe('findCustomerByEmail', () => {
    it('should return customer entity when customer exists', async () => {
      const customerEntity: CustomerEntity = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(customerEntity);

      const result = await customerRepository.findCustomerByEmail('john.doe@example.com');

      expect(result).toEqual(customerEntity);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
    });

    it('should return null when customer does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await customerRepository.findCustomerByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw error when findOne fails', async () => {
      const error = new Error('Database connection error');
      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(customerRepository.findCustomerByEmail('john.doe@example.com')).rejects.toThrow('Database connection error');
    });
  });

  describe('clientExistsWithEmail', () => {
    it('should return true when customer exists', async () => {
      jest.spyOn(repository, 'exists').mockResolvedValue(true);

      const result = await customerRepository.clientExistsWithEmail('john.doe@example.com');

      expect(result).toBe(true);
      expect(repository.exists).toHaveBeenCalledTimes(1);
      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
    });

    it('should return false when customer does not exist', async () => {
      jest.spyOn(repository, 'exists').mockResolvedValue(false);

      const result = await customerRepository.clientExistsWithEmail('nonexistent@example.com');

      expect(result).toBe(false);
      expect(repository.exists).toHaveBeenCalledTimes(1);
      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw error when exists fails', async () => {
      const error = new Error('Database timeout error');
      jest.spyOn(repository, 'exists').mockRejectedValue(error);

      await expect(customerRepository.clientExistsWithEmail('john.doe@example.com')).rejects.toThrow('Database timeout error');
    });
  });
});
