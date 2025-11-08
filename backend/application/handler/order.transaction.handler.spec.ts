import { Test, TestingModule } from '@nestjs/testing';
import { OrderTransactionHandler } from './order.transaction.handler';
import { OrderTransactionServicePort } from 'domain/api/order.transaction.service.port';
import { StartOrderTransactionRequest } from 'application/dto/request/start.order.transaction.request';
import { OrderTransaction } from 'domain/model/order.transaction.model';
import { OrderTransactionResponse } from 'application/dto/response/order.transaction.response';
import { TransactionStatus } from 'domain/model/transaction.status.model';
import { Status } from 'domain/model/enum/status.enum';

describe('OrderTransactionHandler', () => {
  let orderTransactionHandler: OrderTransactionHandler;
  let orderTransactionServicePort: OrderTransactionServicePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderTransactionHandler,
        {
          provide: 'OrderTransactionUseCase',
          useValue: {
            startTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    orderTransactionHandler = module.get<OrderTransactionHandler>(OrderTransactionHandler);
    orderTransactionServicePort = module.get<OrderTransactionServicePort>('OrderTransactionUseCase');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startTransaction', () => {
    const mockRequest: StartOrderTransactionRequest = {
      quantity: 2,
      customer: {
        name: 'Juan Carlos',
        lastName: 'González',
        dni: '12345678',
        phone: '+573001234567',
        email: 'juan.gonzalez@example.com',
      },
      productId: '550e8400-e29b-41d4-a716-446655440000',
      delivery: {
        address: 'Calle 123 #45-67',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'Juan Carlos González',
      },
    };

    const mockOrderTransaction: OrderTransaction = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      paymentGatewayTransactionId: 'txn_wompi_123456789',
      quantity: 2,
      product: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Laptop Dell XPS 15',
        description: 'High-performance laptop',
        price: 299999,
        stock: 25,
        image: 'https://example.com/laptop.jpg',
      },
      delivery: {
        id: 'delivery_123',
        address: 'Calle 123 #45-67',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'Juan Carlos González',
        fee: 15000,
      },
      total: 614998,
      status: {
        id: 1,
        name: Status.PENDING,
      },
      createdAt: new Date('2024-12-08T10:30:00Z'),
      customer: {
        id: 'customer_123',
        name: 'Juan Carlos',
        lastName: 'González',
        dni: '12345678',
        phone: '+573001234567',
        email: 'juan.gonzalez@example.com',
      },
    };

    const expectedOrderTransactionResponse: OrderTransactionResponse = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      paymentGatewayTransactionId: 'txn_wompi_123456789',
      quantity: 2,
      product: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Laptop Dell XPS 15',
        description: 'High-performance laptop',
        price: 299999,
        image: 'https://example.com/laptop.jpg',
      },
      delivery: {
        id: 'delivery_123',
        address: 'Calle 123 #45-67',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'Juan Carlos González',
        fee: 15000,
      },
      total: 614998,
      status: Status.PENDING,
      createdAt: new Date('2024-12-08T10:30:00Z'),
      customer: {
        id: 'customer_123',
        name: 'Juan Carlos',
        lastName: 'González',
        dni: '12345678',
        phone: '+573001234567',
        email: 'juan.gonzalez@example.com',
      },
    };

    it('should successfully start transaction and return order transaction', async () => {
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      const result = await orderTransactionHandler.startTransaction(mockRequest);

      expect(result).toEqual(expectedOrderTransactionResponse);
      expect(orderTransactionServicePort.startTransaction).toHaveBeenCalledTimes(1);
    });

    it('should correctly map all customer fields from request', async () => {
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(mockRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.customer).toEqual({
        name: 'Juan Carlos',
        lastName: 'González',
        dni: '12345678',
        phone: '+573001234567',
        email: 'juan.gonzalez@example.com',
      });
    });

    it('should correctly map all delivery fields from request', async () => {
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(mockRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.delivery).toEqual({
        address: 'Calle 123 #45-67',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'Juan Carlos González',
      });
    });

    it('should correctly map product and quantity from request', async () => {
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(mockRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.quantity).toBe(2);
      expect(calledArgument.product).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('should handle different customer data correctly', async () => {
      const differentRequest: StartOrderTransactionRequest = {
        quantity: 1,
        customer: {
          name: 'María José',
          lastName: 'Rodríguez López',
          dni: '87654321',
          phone: '+573109876543',
          email: 'maria.rodriguez@empresa.co',
        },
        productId: '123e4567-e89b-12d3-a456-426614174000',
        delivery: {
          address: 'Carrera 45 #12-34, Torre B, Apt 501',
          country: 'Colombia',
          city: 'Medellín',
          region: 'Antioquia',
          postalCode: '050001',
          destinataireName: 'María José Rodríguez',
        },
      };

      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(differentRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.customer.name).toBe('María José');
      expect(calledArgument.customer.email).toBe('maria.rodriguez@empresa.co');
      expect(calledArgument.delivery.city).toBe('Medellín');
      expect(calledArgument.delivery.region).toBe('Antioquia');
      expect(calledArgument.product.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle large quantities correctly', async () => {
      const largeQuantityRequest: StartOrderTransactionRequest = {
        ...mockRequest,
        quantity: 999,
      };

      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(largeQuantityRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.quantity).toBe(999);
    });

    it('should propagate service port errors correctly', async () => {
      const serviceError = new Error('Product not found');
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockRejectedValue(serviceError);

      await expect(orderTransactionHandler.startTransaction(mockRequest)).rejects.toThrow('Product not found');
      expect(orderTransactionServicePort.startTransaction).toHaveBeenCalledTimes(1);
    });

    it('should handle service port validation errors', async () => {
      const validationError = new Error('Invalid quantity: must be greater than 0');
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockRejectedValue(validationError);

      await expect(orderTransactionHandler.startTransaction(mockRequest)).rejects.toThrow(
        'Invalid quantity: must be greater than 0'
      );
    });

    it('should handle service port timeout errors', async () => {
      const timeoutError = new Error('Service timeout');
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockRejectedValue(timeoutError);

      await expect(orderTransactionHandler.startTransaction(mockRequest)).rejects.toThrow('Service timeout');
    });

    it('should pass exact mapped object structure to service port', async () => {
      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(mockRequest);

      expect(orderTransactionServicePort.startTransaction).toHaveBeenCalledWith({
        quantity: 2,
        product: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        delivery: {
          address: 'Calle 123 #45-67',
          country: 'Colombia',
          city: 'Bogotá',
          region: 'Cundinamarca',
          postalCode: '110111',
          destinataireName: 'Juan Carlos González',
        },
        customer: {
          name: 'Juan Carlos',
          lastName: 'González',
          dni: '12345678',
          phone: '+573001234567',
          email: 'juan.gonzalez@example.com',
        },
      });
    });

    it('should handle special characters in delivery address', async () => {
      const specialCharsRequest: StartOrderTransactionRequest = {
        ...mockRequest,
        delivery: {
          ...mockRequest.delivery,
          address: 'Av. José María Córdova #123-45, Edificio "El Dorado", Apto 8B',
          destinataireName: 'José María Ñúñez',
        },
      };

      jest.spyOn(orderTransactionServicePort, 'startTransaction').mockResolvedValue(mockOrderTransaction);

      await orderTransactionHandler.startTransaction(specialCharsRequest);

      const calledArgument = (orderTransactionServicePort.startTransaction as jest.Mock).mock.calls[0][0];
      expect(calledArgument.delivery.address).toBe('Av. José María Córdova #123-45, Edificio "El Dorado", Apto 8B');
      expect(calledArgument.delivery.destinataireName).toBe('José María Ñúñez');
    });
  });
});
