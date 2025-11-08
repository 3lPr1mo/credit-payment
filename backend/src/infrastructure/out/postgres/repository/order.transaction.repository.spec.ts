import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTransactionRepository } from './order.transaction.repository';
import { OrderTransactionEntity } from '../entity/oder.transaction.entity';
import { ProductEntity } from '../entity/product.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { CustomerEntity } from '../entity/customer.entity';

describe('OrderTransactionRepository', () => {
  let orderTransactionRepository: OrderTransactionRepository;
  let repository: Repository<OrderTransactionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderTransactionRepository,
        {
          provide: getRepositoryToken(OrderTransactionEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    orderTransactionRepository = module.get<OrderTransactionRepository>(OrderTransactionRepository);
    repository = module.get<Repository<OrderTransactionEntity>>(getRepositoryToken(OrderTransactionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveOrderTransaction', () => {
    it('should call save method with order transaction entity', async () => {
      const mockProduct: ProductEntity = {
        id: 'product-uuid-1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-1',
        address: '123 Main Street',
        country: 'United States',
        city: 'New York',
        region: 'NY',
        postalCode: '10001',
        destinataireName: 'John Doe',
        fee: 15.99,
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-1',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      } as CustomerEntity;

      const orderTransactionEntity: OrderTransactionEntity = {
        id: 'transaction-uuid-1',
        paymentGatewayTransactionId: 'gateway-trans-123',
        quantity: 2,
        product: mockProduct,
        delivery: mockDelivery,
        total: 215.97,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        acceptancePersonalDataAuthorization: 'accepted',
        customer: mockCustomer,
        createdAt: new Date('2023-01-01'),
      };

      jest.spyOn(repository, 'save').mockResolvedValue(orderTransactionEntity as any);

      await orderTransactionRepository.saveOrderTransaction(orderTransactionEntity);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(orderTransactionEntity);
    });

    it('should return the saved order transaction entity', async () => {
      const mockProduct: ProductEntity = {
        id: 'product-uuid-2',
        name: 'Another Product',
        description: 'Another Description',
        price: 49.99,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-2',
        address: '456 Oak Avenue',
        country: 'Canada',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V 3A8',
        destinataireName: 'Jane Smith',
        fee: 12.50,
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 2,
        name: 'COMPLETED',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-2',
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      } as CustomerEntity;

      const orderTransactionEntity: OrderTransactionEntity = {
        id: 'transaction-uuid-2',
        paymentGatewayTransactionId: 'gateway-trans-456',
        quantity: 1,
        product: mockProduct,
        delivery: mockDelivery,
        total: 62.49,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        acceptancePersonalDataAuthorization: 'accepted',
        customer: mockCustomer,
        createdAt: new Date('2023-01-02'),
      };

      jest.spyOn(repository, 'save').mockResolvedValue(orderTransactionEntity as any);

      const result = await orderTransactionRepository.saveOrderTransaction(orderTransactionEntity);

      expect(result).toEqual(orderTransactionEntity);
    });

    it('should save order transaction entity without optional fields', async () => {
      const mockProduct: ProductEntity = {
        id: 'product-uuid-3',
        name: 'Basic Product',
        description: 'Basic Description',
        price: 25.00,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-3',
        address: '789 Pine Street',
        country: 'Mexico',
        city: 'Guadalajara',
        region: 'Jalisco',
        postalCode: '44100',
        destinataireName: 'Carlos Rodriguez',
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 3,
        name: 'PENDING',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-3',
        name: 'Carlos',
        lastName: 'Rodriguez',
        dni: '11111111',
        phone: '111111111',
        email: 'carlos.rodriguez@example.com',
      } as CustomerEntity;

      const orderTransactionEntity: OrderTransactionEntity = {
        quantity: 3,
        product: mockProduct,
        delivery: mockDelivery,
        total: 75.00,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        customer: mockCustomer,
      };

      const savedEntity = {
        ...orderTransactionEntity,
        id: 'auto-generated-uuid',
        createdAt: new Date(),
      };

      jest.spyOn(repository, 'save').mockResolvedValue(savedEntity as any);

      const result = await orderTransactionRepository.saveOrderTransaction(orderTransactionEntity);

      expect(repository.save).toHaveBeenCalledWith(orderTransactionEntity);
      expect(result).toEqual(savedEntity);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should save order transaction entity with zero total', async () => {
      const mockProduct: ProductEntity = {
        id: 'product-uuid-4',
        name: 'Free Product',
        description: 'Free Description',
        price: 0,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-4',
        address: '101 Elm Street',
        country: 'United Kingdom',
        city: 'London',
        region: 'England',
        postalCode: 'SW1A 1AA',
        destinataireName: 'William Brown',
        fee: 0,
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 4,
        name: 'COMPLETED',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-4',
        name: 'William',
        lastName: 'Brown',
        dni: '22222222',
        phone: '222222222',
        email: 'william.brown@example.com',
      } as CustomerEntity;

      const orderTransactionEntity: OrderTransactionEntity = {
        id: 'transaction-uuid-4',
        quantity: 1,
        product: mockProduct,
        delivery: mockDelivery,
        total: 0,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        acceptancePersonalDataAuthorization: 'accepted',
        customer: mockCustomer,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(orderTransactionEntity as any);

      const result = await orderTransactionRepository.saveOrderTransaction(orderTransactionEntity);

      expect(repository.save).toHaveBeenCalledWith(orderTransactionEntity);
      expect(result.total).toBe(0);
    });

    it('should save order transaction entity with large quantity and total', async () => {
      const mockProduct: ProductEntity = {
        id: 'product-uuid-5',
        name: 'Bulk Product',
        description: 'Bulk Description',
        price: 999.99,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-5',
        address: '202 Cedar Lane',
        country: 'Australia',
        city: 'Sydney',
        region: 'NSW',
        postalCode: '2000',
        destinataireName: 'Emily Johnson',
        fee: 50.00,
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 5,
        name: 'PROCESSING',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-5',
        name: 'Emily',
        lastName: 'Johnson',
        dni: '33333333',
        phone: '333333333',
        email: 'emily.johnson@example.com',
      } as CustomerEntity;

      const orderTransactionEntity: OrderTransactionEntity = {
        id: 'transaction-uuid-5',
        paymentGatewayTransactionId: 'gateway-trans-999',
        quantity: 100,
        product: mockProduct,
        delivery: mockDelivery,
        total: 100049.00,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        acceptancePersonalDataAuthorization: 'accepted',
        customer: mockCustomer,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(orderTransactionEntity as any);

      const result = await orderTransactionRepository.saveOrderTransaction(orderTransactionEntity);

      expect(result.quantity).toBe(100);
      expect(result.total).toBe(100049.00);
    });

    it('should throw error when save fails with database connection error', async () => {
      const orderTransactionEntity: OrderTransactionEntity = {
        quantity: 1,
        total: 50.00,
        acceptanceEndUserPolicy: 'accepted',
      } as OrderTransactionEntity;

      const error = new Error('Database connection error');
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(orderTransactionRepository.saveOrderTransaction(orderTransactionEntity)).rejects.toThrow('Database connection error');
      expect(repository.save).toHaveBeenCalledWith(orderTransactionEntity);
    });

    it('should throw error when save fails with constraint violation', async () => {
      const orderTransactionEntity: OrderTransactionEntity = {
        quantity: 1,
        total: 50.00,
        acceptanceEndUserPolicy: 'accepted',
      } as OrderTransactionEntity;

      const constraintError = new Error('Constraint violation: quantity must be positive');
      jest.spyOn(repository, 'save').mockRejectedValue(constraintError);

      await expect(orderTransactionRepository.saveOrderTransaction(orderTransactionEntity)).rejects.toThrow('Constraint violation: quantity must be positive');
    });

    it('should throw error when save fails with network timeout', async () => {
      const orderTransactionEntity: OrderTransactionEntity = {
        quantity: 5,
        total: 125.00,
        acceptanceEndUserPolicy: 'accepted',
      } as OrderTransactionEntity;

      const timeoutError = new Error('Connection timeout');
      jest.spyOn(repository, 'save').mockRejectedValue(timeoutError);

      await expect(orderTransactionRepository.saveOrderTransaction(orderTransactionEntity)).rejects.toThrow('Connection timeout');
    });
  });

  describe('findTransactionById', () => {
    it('should return order transaction entity when transaction exists', async () => {
      const transactionId = 'existing-transaction-uuid';
      
      const mockProduct: ProductEntity = {
        id: 'product-uuid-6',
        name: 'Found Product',
        description: 'Found Description',
        price: 75.50,
      } as ProductEntity;

      const mockDelivery: DeliveryEntity = {
        id: 'delivery-uuid-6',
        address: '303 Maple Drive',
        country: 'Germany',
        city: 'Berlin',
        region: 'Brandenburg',
        postalCode: '10115',
        destinataireName: 'Hans Mueller',
        fee: 25.00,
      } as DeliveryEntity;

      const mockStatus: TransactionStatusEntity = {
        id: 6,
        name: 'COMPLETED',
      } as TransactionStatusEntity;

      const mockCustomer: CustomerEntity = {
        id: 'customer-uuid-6',
        name: 'Hans',
        lastName: 'Mueller',
        dni: '44444444',
        phone: '444444444',
        email: 'hans.mueller@example.com',
      } as CustomerEntity;

      const expectedTransaction: OrderTransactionEntity = {
        id: transactionId,
        paymentGatewayTransactionId: 'gateway-found-123',
        quantity: 2,
        product: mockProduct,
        delivery: mockDelivery,
        total: 176.00,
        status: mockStatus,
        acceptanceEndUserPolicy: 'accepted',
        acceptancePersonalDataAuthorization: 'accepted',
        customer: mockCustomer,
        createdAt: new Date('2023-01-03'),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedTransaction);

      const result = await orderTransactionRepository.findTransactionById(transactionId);

      expect(result).toEqual(expectedTransaction);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
        relations: ['product', 'delivery', 'status', 'customer'],
      });
    });

    it('should return null when transaction does not exist', async () => {
      const nonExistentId = 'non-existent-uuid';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await orderTransactionRepository.findTransactionById(nonExistentId);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
        relations: ['product', 'delivery', 'status', 'customer'],
      });
    });

    it('should return transaction with all relations loaded', async () => {
      const transactionId = 'transaction-with-relations';

      const mockTransaction: OrderTransactionEntity = {
        id: transactionId,
        quantity: 1,
        total: 100.00,
        acceptanceEndUserPolicy: 'accepted',
        product: { id: 'prod-1', name: 'Product 1' } as ProductEntity,
        delivery: { id: 'del-1', address: 'Address 1' } as DeliveryEntity,
        status: { id: 1, name: 'PENDING' } as TransactionStatusEntity,
        customer: { id: 'cust-1', name: 'Customer 1' } as CustomerEntity,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransaction);

      const result = await orderTransactionRepository.findTransactionById(transactionId);

      expect(result).toBeDefined();
      expect(result?.product).toBeDefined();
      expect(result?.delivery).toBeDefined();
      expect(result?.status).toBeDefined();
      expect(result?.customer).toBeDefined();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
        relations: ['product', 'delivery', 'status', 'customer'],
      });
    });

    it('should handle empty string id', async () => {
      const emptyId = '';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await orderTransactionRepository.findTransactionById(emptyId);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: emptyId },
        relations: ['product', 'delivery', 'status', 'customer'],
      });
    });

    it('should handle malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await orderTransactionRepository.findTransactionById(malformedId);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: malformedId },
        relations: ['product', 'delivery', 'status', 'customer'],
      });
    });

    it('should throw error when findOne fails with database error', async () => {
      const transactionId = 'error-transaction-uuid';
      const error = new Error('Database connection error');

      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(orderTransactionRepository.findTransactionById(transactionId)).rejects.toThrow('Database connection error');
    });

    it('should throw error when findOne fails with timeout error', async () => {
      const transactionId = 'timeout-transaction-uuid';
      const timeoutError = new Error('Query timeout');

      jest.spyOn(repository, 'findOne').mockRejectedValue(timeoutError);

      await expect(orderTransactionRepository.findTransactionById(transactionId)).rejects.toThrow('Query timeout');
    });

    it('should throw error when findOne fails with invalid relation error', async () => {
      const transactionId = 'invalid-relation-uuid';
      const relationError = new Error('Invalid relation specified');

      jest.spyOn(repository, 'findOne').mockRejectedValue(relationError);

      await expect(orderTransactionRepository.findTransactionById(transactionId)).rejects.toThrow('Invalid relation specified');
    });
  });
});
