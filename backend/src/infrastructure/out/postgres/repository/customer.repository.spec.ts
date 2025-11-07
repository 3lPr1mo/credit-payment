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

    it('should return void when saving is successful', async () => {
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

      expect(result).toBeUndefined();
    });
  });

  describe('findCustomerByEmail', () => {
    it('should return true when customer exists', async () => {
      jest.spyOn(repository, 'exists').mockResolvedValue(true);

      const result = await customerRepository.findCustomerByEmail('john.doe@example.com');

      expect(result).toBe(true);
      expect(repository.exists).toHaveBeenCalledTimes(1);
      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
    });

    it('should return false when customer does not exist', async () => {
      jest.spyOn(repository, 'exists').mockResolvedValue(false);

      const result = await customerRepository.findCustomerByEmail('nonexistent@example.com');

      expect(result).toBe(false);
      expect(repository.exists).toHaveBeenCalledTimes(1);
      expect(repository.exists).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });
});
