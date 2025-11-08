import { Test, TestingModule } from '@nestjs/testing';
import { OrderTransactionAdapter } from './order.transaction.adapter';
import { OrderTransactionRepository } from '../repository/order.transaction.repository';
import { OrderTransactionEntity } from '../entity/oder.transaction.entity';
import { OrderTransaction } from 'domain/model/order.transaction.model';
import { Status } from 'domain/model/enum/status.enum';
import { ProductEntity } from '../entity/product.entity';
import { CustomerEntity } from '../entity/customer.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';

describe('OrderTransactionAdapter', () => {
  let orderTransactionAdapter: OrderTransactionAdapter;
  let orderTransactionRepository: OrderTransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderTransactionAdapter,
        {
          provide: OrderTransactionRepository,
          useValue: {
            saveOrderTransaction: jest.fn(),
            findTransactionById: jest.fn(),
          },
        },
      ],
    }).compile();

    orderTransactionAdapter = module.get<OrderTransactionAdapter>(OrderTransactionAdapter);
    orderTransactionRepository = module.get<OrderTransactionRepository>(OrderTransactionRepository);
  });

  describe('saveOrderTransaction', () => {
    it('should convert order transaction model to entity and save it', async () => {
      const orderTransaction: OrderTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentGatewayTransactionId: 'gateway-123',
        quantity: 2,
        product: {
          id: 'product-123',
          name: 'Test Product',
          description: 'Test Description',
          price: 100.50,
          stock: 10,
          image: 'product.jpg',
        },
        delivery: {
          id: 'delivery-123',
          address: '123 Test Street',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'John Doe',
          postalCode: '110111',
          fee: 15.00,
        },
        total: 216.00,
        status: {
          id: 1,
          name: Status.PENDING,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'personal-data-token',
        },
        customer: {
          id: 'customer-123',
          name: 'John',
          lastName: 'Doe',
          dni: '12345678',
          phone: '123456789',
          email: 'john.doe@example.com',
        },
        createdAt: new Date('2023-01-01T10:00:00Z'),
      };

      const mockSavedEntity: OrderTransactionEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentGatewayTransactionId: 'gateway-123',
        quantity: 2,
        product: {
          id: 'product-123',
          name: 'Test Product',
          description: 'Test Description',
          price: 100.50,
          stock: 10,
          image: 'product.jpg',
        },
        delivery: {
          id: 'delivery-123',
          address: '123 Test Street',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'John Doe',
          postalCode: '110111',
          fee: 15.00,
        },
        total: 216.00,
        status: {
          id: 1,
          name: Status.PENDING,
        },
        acceptanceEndUserPolicy: 'end-user-token',
        acceptancePersonalDataAuthorization: 'personal-data-token',
        customer: {
          id: 'customer-123',
          name: 'John',
          lastName: 'Doe',
          dni: '12345678',
          phone: '123456789',
          email: 'john.doe@example.com',
        },
        createdAt: new Date('2023-01-01T10:00:00Z'),
      };

      jest.spyOn(orderTransactionRepository, 'saveOrderTransaction').mockResolvedValue(mockSavedEntity);

      const result = await orderTransactionAdapter.saveOrderTransaction(orderTransaction);

      expect(orderTransactionRepository.saveOrderTransaction).toHaveBeenCalledTimes(1);
      const savedEntity = (orderTransactionRepository.saveOrderTransaction as jest.Mock).mock.calls[0][0];
      
      // Verify entity structure
      expect(savedEntity.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(savedEntity.paymentGatewayTransactionId).toBe('gateway-123');
      expect(savedEntity.quantity).toBe(2);
      expect(savedEntity.total).toBe(216.00);
      expect(savedEntity.acceptanceEndUserPolicy).toBe('end-user-token');
      expect(savedEntity.acceptancePersonalDataAuthorization).toBe('personal-data-token');
      expect(savedEntity.createdAt).toEqual(new Date('2023-01-01T10:00:00Z'));

      // Verify nested objects conversion
      expect(savedEntity.product).toEqual({
        id: 'product-123',
        name: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        stock: 10,
        image: 'product.jpg',
      });

      expect(savedEntity.delivery).toEqual({
        id: 'delivery-123',
        address: '123 Test Street',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        destinataireName: 'John Doe',
        postalCode: '110111',
        fee: 15.00,
      });

      expect(savedEntity.customer).toEqual({
        id: 'customer-123',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      });

      expect(savedEntity.status).toEqual({
        id: 1,
        name: Status.PENDING,
      });

      // Verify return value conversion back to model
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentGatewayTransactionId: 'gateway-123',
        quantity: 2,
        product: mockSavedEntity.product,
        delivery: mockSavedEntity.delivery,
        total: 216.00,
        status: {
          id: 1,
          name: Status.PENDING,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'personal-data-token',
        },
        customer: mockSavedEntity.customer,
        createdAt: new Date('2023-01-01T10:00:00Z'),
      });
    });

    it('should handle order transaction with minimal required data', async () => {
      const orderTransaction: OrderTransaction = {
        quantity: 1,
        product: {
          id: 'product-min',
          name: 'Minimal Product',
          description: 'Minimal description',
          price: 50.0,
          stock: 10,
        },
        delivery: {
          address: 'Min Address',
          country: 'Colombia',
          city: 'Medellín',
          region: 'Antioquia',
          destinataireName: 'Jane Doe',
          postalCode: '050001',
        },
        customer: {
          id: 'customer-jane',
          name: 'Jane',
          lastName: 'Doe',
          dni: '87654321',
          phone: '987654321',
          email: 'jane.doe@example.com',
        },
        status: {
          id: 1,
          name: Status.PENDING,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'minimal-end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'minimal-personal-data-token',
        },
      };

      const mockSavedEntity: Partial<OrderTransactionEntity> = {
        id: 'generated-id',
        quantity: 1,
        product: {
          id: 'product-min',
          name: 'Minimal Product',
          description: 'Minimal description',
          price: 50.0,
          stock: 10,
        } as ProductEntity,
        delivery: {
          id: 'delivery-min',
          address: 'Min Address',
          country: 'Colombia',
          city: 'Medellín',
          region: 'Antioquia',
          destinataireName: 'Jane Doe',
          postalCode: '050001',
        } as DeliveryEntity,
        customer: {
          id: 'customer-jane',
          name: 'Jane',
          lastName: 'Doe',
          dni: '87654321',
          phone: '987654321',
          email: 'jane.doe@example.com',
        } as CustomerEntity,
        status: { id: 1, name: Status.PENDING } as TransactionStatusEntity,
        acceptanceEndUserPolicy: 'minimal-end-user-token',
        acceptancePersonalDataAuthorization: 'minimal-personal-data-token',
        createdAt: new Date(),
      };

      jest.spyOn(orderTransactionRepository, 'saveOrderTransaction').mockResolvedValue(mockSavedEntity as OrderTransactionEntity);

      const result = await orderTransactionAdapter.saveOrderTransaction(orderTransaction);

      expect(orderTransactionRepository.saveOrderTransaction).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('generated-id');
      expect(result.quantity).toBe(1);
      expect(result.product.name).toBe('Minimal Product');
      expect(result.delivery.city).toBe('Medellín');
      expect(result.customer.name).toBe('Jane');
    });

    it('should handle different status types correctly', async () => {
      const testStatuses = [Status.APPROVED, Status.DECLINED, Status.VOIDED, Status.ERROR];

      for (const status of testStatuses) {
        const orderTransaction: OrderTransaction = {
          quantity: 1,
          product: { id: 'product-1', name: 'Product', description: 'Test description', price: 100, stock: 5 },
          delivery: {
            address: 'Test Address',
            country: 'Colombia',
            city: 'Bogotá',
            region: 'Cundinamarca',
            destinataireName: 'Test User',
            postalCode: '110111',
          },
          customer: {
            id: 'customer-test',
            name: 'Test',
            lastName: 'User',
            dni: '12345678',
            phone: '123456789',
            email: 'test@example.com',
          },
          status: { id: 1, name: status },
          acceptanceEndUserPolicy: {
            acceptanceToken: 'test-end-user-token',
          },
          acceptancePersonalDataAuthorization: {
            acceptanceToken: 'test-personal-data-token',
          },
        };

        const mockSavedEntity: Partial<OrderTransactionEntity> = {
          id: 'test-id',
          status: { id: 1, name: status } as TransactionStatusEntity,
          quantity: 1,
          product: {
            id: 'product-1',
            name: 'Product',
            description: 'Test description',
            price: 100,
            stock: 5,
          } as ProductEntity,
          delivery: {
            id: 'delivery-test',
            address: 'Test Address',
            country: 'Colombia',
            city: 'Bogotá',
            region: 'Cundinamarca',
            destinataireName: 'Test User',
            postalCode: '110111',
          } as DeliveryEntity,
          customer: {
            id: 'customer-test',
            name: 'Test',
            lastName: 'User',
            dni: '12345678',
            phone: '123456789',
            email: 'test@example.com',
          } as CustomerEntity,
          acceptanceEndUserPolicy: 'test-end-user-token',
          acceptancePersonalDataAuthorization: 'test-personal-data-token',
        };

        jest.spyOn(orderTransactionRepository, 'saveOrderTransaction').mockResolvedValue(mockSavedEntity as OrderTransactionEntity);

        const result = await orderTransactionAdapter.saveOrderTransaction(orderTransaction);

        expect(result.status.name).toBe(status);
      }
    });

    it('should handle repository errors when saving order transaction', async () => {
      const orderTransaction: OrderTransaction = {
        quantity: 1,
        product: { id: 'product-1', name: 'Product', description: 'Test description', price: 100, stock: 5 },
        delivery: {
          address: 'Test Address',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'Test User',
          postalCode: '110111',
        },
        customer: {
          id: 'customer-test',
          name: 'Test',
          lastName: 'User',
          dni: '12345678',
          phone: '123456789',
          email: 'test@example.com',
        },
        status: {
          id: 1,
          name: Status.PENDING,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'error-end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'error-personal-data-token',
        },
      };

      const error = new Error('Database connection failed');
      jest.spyOn(orderTransactionRepository, 'saveOrderTransaction').mockRejectedValue(error);

      await expect(orderTransactionAdapter.saveOrderTransaction(orderTransaction)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findTransactionById', () => {
    it('should find transaction by id and convert entity to model', async () => {
      const mockEntity: OrderTransactionEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentGatewayTransactionId: 'gateway-123',
        quantity: 2,
        product: {
          id: 'product-123',
          name: 'Test Product',
          description: 'Test Description',
          price: 100.50,
          stock: 10,
          image: 'product.jpg',
        },
        delivery: {
          id: 'delivery-123',
          address: '123 Test Street',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'John Doe',
          postalCode: '110111',
          fee: 15.00,
        },
        total: 216.00,
        status: {
          id: 1,
          name: Status.APPROVED,
        },
        acceptanceEndUserPolicy: 'end-user-token',
        acceptancePersonalDataAuthorization: 'personal-data-token',
        customer: {
          id: 'customer-123',
          name: 'John',
          lastName: 'Doe',
          dni: '12345678',
          phone: '123456789',
          email: 'john.doe@example.com',
        },
        createdAt: new Date('2023-01-01T10:00:00Z'),
      };

      jest.spyOn(orderTransactionRepository, 'findTransactionById').mockResolvedValue(mockEntity);

      const result = await orderTransactionAdapter.findTransactionById('123e4567-e89b-12d3-a456-426614174000');

      expect(orderTransactionRepository.findTransactionById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(orderTransactionRepository.findTransactionById).toHaveBeenCalledTimes(1);

      // Verify model structure
      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentGatewayTransactionId: 'gateway-123',
        quantity: 2,
        product: mockEntity.product,
        delivery: mockEntity.delivery,
        total: 216.00,
        status: {
          id: 1,
          name: Status.APPROVED,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'personal-data-token',
        },
        customer: mockEntity.customer,
        createdAt: new Date('2023-01-01T10:00:00Z'),
      });
    });

    it('should handle entity with partial data', async () => {
      const mockEntity: Partial<OrderTransactionEntity> = {
        id: 'partial-id',
        quantity: 1,
        product: {
          id: 'product-1',
          name: 'Product',
          description: 'Product description',
          price: 50,
          stock: 3,
        } as ProductEntity,
        delivery: {
          id: 'delivery-partial',
          address: 'Address',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'User',
          postalCode: '110111',
        } as DeliveryEntity,
        customer: {
          id: 'customer-partial',
          name: 'Test',
          lastName: 'User',
          dni: '12345678',
          phone: '123456789',
          email: 'test@example.com',
        } as CustomerEntity,
        status: { id: 1, name: Status.PENDING } as TransactionStatusEntity,
      };

      jest.spyOn(orderTransactionRepository, 'findTransactionById').mockResolvedValue(mockEntity as OrderTransactionEntity);

      const result = await orderTransactionAdapter.findTransactionById('partial-id');

      expect(result.id).toBe('partial-id');
      expect(result.quantity).toBe(1);
      expect(result.status.name).toBe(Status.PENDING);
      expect(result.product).toEqual(mockEntity.product);
      expect(result.delivery).toEqual(mockEntity.delivery);
      expect(result.customer).toEqual(mockEntity.customer);
    });

    it('should handle different status enums in entity to model conversion', async () => {
      const testStatuses = [Status.PENDING, Status.APPROVED, Status.DECLINED, Status.VOIDED, Status.ERROR];

      for (const status of testStatuses) {
        const mockEntity: Partial<OrderTransactionEntity> = {
          id: `test-id-${status}`,
          quantity: 1,
          product: {
            id: 'product-1',
            name: 'Product',
            description: 'Product description',
            price: 50,
            stock: 3,
          } as ProductEntity,
          delivery: {
            id: 'delivery-status',
            address: 'Address',
            country: 'Colombia',
            city: 'Bogotá',
            region: 'Cundinamarca',
            destinataireName: 'User',
            postalCode: '110111',
          } as DeliveryEntity,
          customer: {
            id: 'customer-status',
            name: 'Test',
            lastName: 'User',
            dni: '12345678',
            phone: '123456789',
            email: 'test@example.com',
          } as CustomerEntity,
          status: { id: 1, name: status } as TransactionStatusEntity,
        };

        jest.spyOn(orderTransactionRepository, 'findTransactionById').mockResolvedValue(mockEntity as OrderTransactionEntity);

        const result = await orderTransactionAdapter.findTransactionById(`test-id-${status}`);

        expect(result.status.name).toBe(status);
        expect(result.status.id).toBe(1);
      }
    });

    it('should handle repository errors when finding transaction by id', async () => {
      const error = new Error('Database query failed');
      jest.spyOn(orderTransactionRepository, 'findTransactionById').mockRejectedValue(error);

      await expect(
        orderTransactionAdapter.findTransactionById('non-existent-id')
      ).rejects.toThrow('Database query failed');
    });

    it('should handle null acceptance tokens correctly', async () => {
      const mockEntity: Partial<OrderTransactionEntity> = {
        id: 'test-id',
        quantity: 1,
        product: {
          id: 'product-1',
          name: 'Product',
          description: 'Product description',
          price: 50,
          stock: 3,
        } as ProductEntity,
        delivery: {
          id: 'delivery-acceptance',
          address: 'Address',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          destinataireName: 'User',
          postalCode: '110111',
        } as DeliveryEntity,
        customer: {
          id: 'customer-acceptance',
          name: 'Test',
          lastName: 'User',
          dni: '12345678',
          phone: '123456789',
          email: 'test@example.com',
        } as CustomerEntity,
        status: { id: 1, name: Status.PENDING } as TransactionStatusEntity,
        acceptanceEndUserPolicy: null,
        acceptancePersonalDataAuthorization: undefined,
      };

      jest.spyOn(orderTransactionRepository, 'findTransactionById').mockResolvedValue(mockEntity as OrderTransactionEntity);

      const result = await orderTransactionAdapter.findTransactionById('test-id');

      expect(result.acceptanceEndUserPolicy).toEqual({
        acceptanceToken: null,
      });
      expect(result.acceptancePersonalDataAuthorization).toEqual({
        acceptanceToken: undefined,
      });
    });
  });

  describe('entity to model conversions', () => {
    it('should correctly convert complex nested objects from entity to model', async () => {
      const complexEntity: OrderTransactionEntity = {
        id: 'complex-id',
        paymentGatewayTransactionId: 'complex-gateway-id',
        quantity: 5,
        product: {
          id: 'complex-product-id',
          name: 'Complex Product Name',
          description: 'Very detailed product description',
          price: 999.99,
          stock: 100,
          image: 'complex-product-image.jpg',
        },
        delivery: {
          id: 'complex-delivery-id',
          address: '456 Complex Avenue, Apt 789',
          country: 'Colombia',
          city: 'Cartagena',
          region: 'Bolívar',
          destinataireName: 'María José García López',
          postalCode: '130001',
          fee: 25.50,
        },
        total: 5024.45,
        status: {
          id: 2,
          name: Status.APPROVED,
        },
        acceptanceEndUserPolicy: 'complex-end-user-policy-token-12345',
        acceptancePersonalDataAuthorization: 'complex-personal-data-auth-token-67890',
        customer: {
          id: 'complex-customer-id',
          name: 'María José',
          lastName: 'García López',
          dni: '1234567890',
          phone: '+57-300-123-4567',
          email: 'maria.garcia@example.com',
        },
        createdAt: new Date('2023-12-25T15:30:45Z'),
      };

      jest.spyOn(orderTransactionRepository, 'findTransactionById').mockResolvedValue(complexEntity);

      const result = await orderTransactionAdapter.findTransactionById('complex-id');

      // Verify all fields are correctly mapped
      expect(result.id).toBe('complex-id');
      expect(result.paymentGatewayTransactionId).toBe('complex-gateway-id');
      expect(result.quantity).toBe(5);
      expect(result.total).toBe(5024.45);
      expect(result.createdAt).toEqual(new Date('2023-12-25T15:30:45Z'));

      // Verify complex nested objects
      expect(result.product).toEqual({
        id: 'complex-product-id',
        name: 'Complex Product Name',
        description: 'Very detailed product description',
        price: 999.99,
        stock: 100,
        image: 'complex-product-image.jpg',
      });

      expect(result.delivery).toEqual({
        id: 'complex-delivery-id',
        address: '456 Complex Avenue, Apt 789',
        country: 'Colombia',
        city: 'Cartagena',
        region: 'Bolívar',
        destinataireName: 'María José García López',
        postalCode: '130001',
        fee: 25.50,
      });

      expect(result.customer).toEqual({
        id: 'complex-customer-id',
        name: 'María José',
        lastName: 'García López',
        dni: '1234567890',
        phone: '+57-300-123-4567',
        email: 'maria.garcia@example.com',
      });

      expect(result.status).toEqual({
        id: 2,
        name: Status.APPROVED,
      });

      expect(result.acceptanceEndUserPolicy).toEqual({
        acceptanceToken: 'complex-end-user-policy-token-12345',
      });

      expect(result.acceptancePersonalDataAuthorization).toEqual({
        acceptanceToken: 'complex-personal-data-auth-token-67890',
      });
    });
  });

  describe('model to entity conversions', () => {
    it('should correctly convert complex nested objects from model to entity', async () => {
      const complexModel: OrderTransaction = {
        id: 'model-complex-id',
        paymentGatewayTransactionId: 'model-gateway-id',
        quantity: 3,
        product: {
          id: 'model-product-id',
          name: 'Model Product',
          description: 'Model Description',
          price: 150.75,
          stock: 50,
          image: 'model-image.png',
        },
        delivery: {
          id: 'model-delivery-id',
          address: '789 Model Street',
          country: 'Colombia',
          city: 'Cali',
          region: 'Valle del Cauca',
          destinataireName: 'Carlos Andrés',
          postalCode: '760001',
          fee: 12.00,
        },
        total: 464.25,
        status: {
          id: 3,
          name: Status.DECLINED,
        },
        acceptanceEndUserPolicy: {
          acceptanceToken: 'model-end-user-token',
        },
        acceptancePersonalDataAuthorization: {
          acceptanceToken: 'model-personal-data-token',
        },
        customer: {
          id: 'model-customer-id',
          name: 'Carlos',
          lastName: 'Andrés',
          dni: '0987654321',
          phone: '321-654-9870',
          email: 'carlos.andres@example.com',
        },
        createdAt: new Date('2023-06-15T08:20:30Z'),
      };

      const mockSavedEntity: OrderTransactionEntity = {
        id: complexModel.id,
        paymentGatewayTransactionId: complexModel.paymentGatewayTransactionId,
        quantity: complexModel.quantity,
        product: complexModel.product as ProductEntity,
        delivery: complexModel.delivery as DeliveryEntity,
        total: complexModel.total,
        status: complexModel.status as TransactionStatusEntity,
        acceptanceEndUserPolicy: 'model-end-user-token',
        acceptancePersonalDataAuthorization: 'model-personal-data-token',
        customer: complexModel.customer as CustomerEntity,
        createdAt: complexModel.createdAt,
      };

      jest.spyOn(orderTransactionRepository, 'saveOrderTransaction').mockResolvedValue(mockSavedEntity);

      await orderTransactionAdapter.saveOrderTransaction(complexModel);

      const savedEntity = (orderTransactionRepository.saveOrderTransaction as jest.Mock).mock.calls[0][0];

      // Verify conversion from model to entity
      expect(savedEntity.id).toBe('model-complex-id');
      expect(savedEntity.paymentGatewayTransactionId).toBe('model-gateway-id');
      expect(savedEntity.quantity).toBe(3);
      expect(savedEntity.total).toBe(464.25);
      expect(savedEntity.createdAt).toEqual(new Date('2023-06-15T08:20:30Z'));

      // Verify acceptance tokens are flattened correctly
      expect(savedEntity.acceptanceEndUserPolicy).toBe('model-end-user-token');
      expect(savedEntity.acceptancePersonalDataAuthorization).toBe('model-personal-data-token');

      // Verify nested objects are properly copied
      expect(savedEntity.product).toEqual(complexModel.product);
      expect(savedEntity.delivery).toEqual(complexModel.delivery);
      expect(savedEntity.customer).toEqual(complexModel.customer);
      expect(savedEntity.status).toEqual(complexModel.status);
    });
  });
});
