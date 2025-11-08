import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { OrderTransactionController } from './order.transaction.controller';
import { OrderTransactionHandler } from 'application/handler/order.transaction.handler';
import { StartOrderTransactionRequest } from 'application/dto/request/start.order.transaction.request';
import { CardRequest } from 'application/dto/request/card.request';
import { OrderTransactionResponse } from 'application/dto/response/order.transaction.response';

describe('OrderTransactionController', () => {
  let controller: OrderTransactionController;
  let handlerMock: jest.Mocked<OrderTransactionHandler>;

  const mockStartOrderTransactionRequest: StartOrderTransactionRequest = {
    quantity: 2,
    productId: '550e8400-e29b-41d4-a716-446655440001',
    customer: {
      name: 'Juan Carlos',
      lastName: 'García López',
      dni: '12345678',
      phone: '+57 301 234 5678',
      email: 'juan.garcia@email.com'
    },
    delivery: {
      address: 'Calle 123 #45-67',
      country: 'Colombia',
      city: 'Bogotá',
      region: 'Cundinamarca',
      postalCode: '110111',
      destinataireName: 'Paula Lopez'
    }
  };

  const mockCardRequest: CardRequest = {
    number: '4111111111111111',
    cvc: '123',
    expMonth: '12',
    expYear: '25',
    cardHolder: 'JUAN CARLOS GARCIA'
  };

  const mockOrderTransactionResponse: OrderTransactionResponse = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    paymentGatewayTransactionId: 'txn_wompi_123456789',
    quantity: 2,
    product: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Laptop Dell XPS 15',
      description: 'High-performance laptop with 16GB RAM and 512GB SSD',
      price: 299999,
      image: 'https://example.com/images/laptop-dell-xps15.jpg'
    },
    delivery: {
      address: 'Calle 123 #45-67',
      country: 'Colombia',
      city: 'Bogotá',
      region: 'Cundinamarca',
      postalCode: '110111',
      destinataireName: 'Paula Lopez'
    },
    customer: {
      name: 'Juan Carlos',
      lastName: 'García López',
      dni: '12345678',
      phone: '+57 301 234 5678',
      email: 'juan.garcia@email.com'
    },
    total: 599998,
    status: 'PENDING',
    createdAt: new Date('2024-12-08T10:30:00Z')
  };

  beforeEach(async () => {
    const mockHandler = {
      startTransaction: jest.fn(),
      finishTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderTransactionController],
      providers: [
        {
          provide: OrderTransactionHandler,
          useValue: mockHandler,
        },
      ],
    }).compile();

    controller = module.get<OrderTransactionController>(OrderTransactionController);
    handlerMock = module.get<OrderTransactionHandler>(OrderTransactionHandler) as jest.Mocked<OrderTransactionHandler>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrderTransaction', () => {
    it('should create an order transaction successfully', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(mockStartOrderTransactionRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledTimes(1);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(mockStartOrderTransactionRequest);
    });

    it('should handle valid request with different customer data', async () => {
      // Arrange
      const differentRequest: StartOrderTransactionRequest = {
        ...mockStartOrderTransactionRequest,
        customer: {
          name: 'María',
          lastName: 'González',
          dni: '87654321',
          phone: '+57 300 987 6543',
          email: 'maria.gonzalez@email.com'
        },
        quantity: 1
      };

      const differentResponse: OrderTransactionResponse = {
        ...mockOrderTransactionResponse,
        customer: {
          name: 'María',
          lastName: 'González',
          dni: '87654321',
          phone: '+57 300 987 6543',
          email: 'maria.gonzalez@email.com'
        },
        quantity: 1
      };

      handlerMock.startTransaction.mockResolvedValue(differentResponse);

      // Act
      const result = await controller.createOrderTransaction(differentRequest);

      // Assert
      expect(result).toEqual(differentResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(differentRequest);
    });

    it('should handle valid request with different product and delivery data', async () => {
      // Arrange
      const differentRequest: StartOrderTransactionRequest = {
        quantity: 3,
        productId: '550e8400-e29b-41d4-a716-446655440999',
        customer: mockStartOrderTransactionRequest.customer,
        delivery: {
          address: 'Carrera 45 #12-34',
          country: 'Colombia',
          city: 'Medellín',
          region: 'Antioquia',
          postalCode: '050001',
          destinataireName: 'Carlos Rodriguez'
        }
      };

      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(differentRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(differentRequest);
    });

    it('should propagate handler errors', async () => {
      // Arrange
      const error = new Error('Product not found');
      handlerMock.startTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createOrderTransaction(mockStartOrderTransactionRequest))
        .rejects.toThrow('Product not found');
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(mockStartOrderTransactionRequest);
    });

    it('should propagate handler errors for validation failures', async () => {
      // Arrange
      const validationError = new Error('Customer already exists');
      handlerMock.startTransaction.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.createOrderTransaction(mockStartOrderTransactionRequest))
        .rejects.toThrow('Customer already exists');
    });

    it('should propagate handler errors for internal server errors', async () => {
      // Arrange
      const internalError = new Error('Internal server error');
      handlerMock.startTransaction.mockRejectedValue(internalError);

      // Act & Assert
      await expect(controller.createOrderTransaction(mockStartOrderTransactionRequest))
        .rejects.toThrow('Internal server error');
    });
  });

  describe('finishOrderTransaction', () => {
    const transactionId = '550e8400-e29b-41d4-a716-446655440002';

    it('should finish an order transaction successfully', async () => {
      // Arrange
      const finishedResponse: OrderTransactionResponse = {
        ...mockOrderTransactionResponse,
        status: 'APPROVED',
        paymentGatewayTransactionId: 'txn_wompi_987654321'
      };
      handlerMock.finishTransaction.mockResolvedValue(finishedResponse);

      // Act
      const result = await controller.finishOrderTransaction(transactionId, mockCardRequest);

      // Assert
      expect(result).toEqual(finishedResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledTimes(1);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(transactionId, mockCardRequest);
    });

    it('should handle valid request with different card data', async () => {
      // Arrange
      const differentCard: CardRequest = {
        number: '5555555555554444',
        cvc: '456',
        expMonth: '06',
        expYear: '26',
        cardHolder: 'MARIA FERNANDA LOPEZ'
      };

      const finishedResponse: OrderTransactionResponse = {
        ...mockOrderTransactionResponse,
        status: 'APPROVED'
      };

      handlerMock.finishTransaction.mockResolvedValue(finishedResponse);

      // Act
      const result = await controller.finishOrderTransaction(transactionId, differentCard);

      // Assert
      expect(result).toEqual(finishedResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(transactionId, differentCard);
    });

    it('should handle valid request with different transaction ID', async () => {
      // Arrange
      const differentTransactionId = '550e8400-e29b-41d4-a716-446655440999';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.finishOrderTransaction(differentTransactionId, mockCardRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(differentTransactionId, mockCardRequest);
    });

    it('should propagate handler errors for invalid transaction ID', async () => {
      // Arrange
      const error = new Error('Transaction not found');
      handlerMock.finishTransaction.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.finishOrderTransaction(transactionId, mockCardRequest))
        .rejects.toThrow('Transaction not found');
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(transactionId, mockCardRequest);
    });

    it('should propagate handler errors for invalid card data', async () => {
      // Arrange
      const cardError = new Error('Invalid card data');
      handlerMock.finishTransaction.mockRejectedValue(cardError);

      // Act & Assert
      await expect(controller.finishOrderTransaction(transactionId, mockCardRequest))
        .rejects.toThrow('Invalid card data');
    });

    it('should propagate handler errors for transaction already finished', async () => {
      // Arrange
      const alreadyFinishedError = new Error('Transaction already finished');
      handlerMock.finishTransaction.mockRejectedValue(alreadyFinishedError);

      // Act & Assert
      await expect(controller.finishOrderTransaction(transactionId, mockCardRequest))
        .rejects.toThrow('Transaction already finished');
    });

    it('should propagate handler errors for payment processing failures', async () => {
      // Arrange
      const paymentError = new Error('Payment processing failed');
      handlerMock.finishTransaction.mockRejectedValue(paymentError);

      // Act & Assert
      await expect(controller.finishOrderTransaction(transactionId, mockCardRequest))
        .rejects.toThrow('Payment processing failed');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle null response from startTransaction', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(null as any);

      // Act & Assert
      const result = await controller.createOrderTransaction(mockStartOrderTransactionRequest);
      expect(result).toBeNull();
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(mockStartOrderTransactionRequest);
    });

    it('should handle null response from finishTransaction', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(null as any);

      // Act & Assert
      const result = await controller.finishOrderTransaction(transactionId, mockCardRequest);
      expect(result).toBeNull();
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(transactionId, mockCardRequest);
    });

    it('should handle undefined response from startTransaction', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(undefined as any);

      // Act & Assert
      const result = await controller.createOrderTransaction(mockStartOrderTransactionRequest);
      expect(result).toBeUndefined();
    });

    it('should handle undefined response from finishTransaction', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(undefined as any);

      // Act & Assert
      const result = await controller.finishOrderTransaction(transactionId, mockCardRequest);
      expect(result).toBeUndefined();
    });
  });

  describe('Method signature validation', () => {
    it('should have correct method signatures for createOrderTransaction', () => {
      expect(controller.createOrderTransaction).toBeDefined();
      expect(typeof controller.createOrderTransaction).toBe('function');
      expect(controller.createOrderTransaction.length).toBe(1);
    });

    it('should have correct method signatures for finishOrderTransaction', () => {
      expect(controller.finishOrderTransaction).toBeDefined();
      expect(typeof controller.finishOrderTransaction).toBe('function');
      expect(controller.finishOrderTransaction.length).toBe(2);
    });
  });

  describe('Constructor validation', () => {
    it('should correctly inject OrderTransactionHandler dependency', () => {
      expect(controller['handler']).toBeDefined();
      expect(controller['handler']).toBe(handlerMock);
    });
  });

  describe('Async behavior validation', () => {
    it('should return Promise for createOrderTransaction', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = controller.createOrderTransaction(mockStartOrderTransactionRequest);

      // Assert
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('should return Promise for finishOrderTransaction', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = controller.finishOrderTransaction(transactionId, mockCardRequest);

      // Assert
      expect(result).toBeInstanceOf(Promise);
      await result;
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty string transaction ID in finishOrderTransaction', async () => {
      // Arrange
      const emptyId = '';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.finishOrderTransaction(emptyId, mockCardRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(emptyId, mockCardRequest);
    });

    it('should handle special characters in transaction ID', async () => {
      // Arrange
      const specialId = 'test-id_123.456@domain';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.finishOrderTransaction(specialId, mockCardRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(specialId, mockCardRequest);
    });

    it('should handle zero quantity in createOrderTransaction', async () => {
      // Arrange
      const zeroQuantityRequest = {
        ...mockStartOrderTransactionRequest,
        quantity: 0
      };
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(zeroQuantityRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(zeroQuantityRequest);
    });

    it('should handle large quantity in createOrderTransaction', async () => {
      // Arrange
      const largeQuantityRequest = {
        ...mockStartOrderTransactionRequest,
        quantity: 999999
      };
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(largeQuantityRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(largeQuantityRequest);
    });

    it('should handle minimum length strings in requests', async () => {
      // Arrange
      const minimalRequest: StartOrderTransactionRequest = {
        quantity: 1,
        productId: 'a',
        customer: {
          name: 'A',
          lastName: 'B',
          dni: '1',
          phone: '1',
          email: 'a@b.c'
        },
        delivery: {
          address: 'A',
          country: 'A',
          city: 'A',
          region: 'A',
          postalCode: '1',
          destinataireName: 'A'
        }
      };
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(minimalRequest);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.startTransaction).toHaveBeenCalledWith(minimalRequest);
    });

    it('should handle maximum length strings in card requests', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      const maximalCard: CardRequest = {
        number: '1234567890123456789',
        cvc: '1234',
        expMonth: '12',
        expYear: '99',
        cardHolder: 'A'.repeat(50) // Maximum length cardholder name
      };
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.finishOrderTransaction(transactionId, maximalCard);

      // Assert
      expect(result).toEqual(mockOrderTransactionResponse);
      expect(handlerMock.finishTransaction).toHaveBeenCalledWith(transactionId, maximalCard);
    });
  });

  describe('Response type validation', () => {
    it('should return OrderTransactionResponse type from createOrderTransaction', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.createOrderTransaction(mockStartOrderTransactionRequest);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        paymentGatewayTransactionId: expect.any(String),
        quantity: expect.any(Number),
        product: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          image: expect.any(String)
        }),
        delivery: expect.objectContaining({
          address: expect.any(String),
          country: expect.any(String),
          city: expect.any(String),
          region: expect.any(String),
          postalCode: expect.any(String),
          destinataireName: expect.any(String)
        }),
        customer: expect.objectContaining({
          name: expect.any(String),
          lastName: expect.any(String),
          dni: expect.any(String),
          phone: expect.any(String),
          email: expect.any(String)
        }),
        total: expect.any(Number),
        status: expect.any(String),
        createdAt: expect.any(Date)
      });
    });

    it('should return OrderTransactionResponse type from finishOrderTransaction', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      const result = await controller.finishOrderTransaction(transactionId, mockCardRequest);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        paymentGatewayTransactionId: expect.any(String),
        quantity: expect.any(Number),
        product: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
          image: expect.any(String)
        }),
        total: expect.any(Number),
        status: expect.any(String),
        createdAt: expect.any(Date)
      });
    });
  });

  describe('Handler method call verification', () => {
    it('should call startTransaction exactly once per request', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      await controller.createOrderTransaction(mockStartOrderTransactionRequest);
      await controller.createOrderTransaction(mockStartOrderTransactionRequest);

      // Assert
      expect(handlerMock.startTransaction).toHaveBeenCalledTimes(2);
    });

    it('should call finishTransaction exactly once per request', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);

      // Act
      await controller.finishOrderTransaction(transactionId, mockCardRequest);
      await controller.finishOrderTransaction(transactionId, mockCardRequest);

      // Assert
      expect(handlerMock.finishTransaction).toHaveBeenCalledTimes(2);
    });

    it('should not call finishTransaction when createOrderTransaction is called', async () => {
      // Arrange
      handlerMock.startTransaction.mockResolvedValue(mockOrderTransactionResponse);
      handlerMock.finishTransaction.mockClear();

      // Act
      await controller.createOrderTransaction(mockStartOrderTransactionRequest);

      // Assert
      expect(handlerMock.finishTransaction).not.toHaveBeenCalled();
    });

    it('should not call startTransaction when finishOrderTransaction is called', async () => {
      // Arrange
      const transactionId = '550e8400-e29b-41d4-a716-446655440002';
      handlerMock.finishTransaction.mockResolvedValue(mockOrderTransactionResponse);
      handlerMock.startTransaction.mockClear();

      // Act
      await controller.finishOrderTransaction(transactionId, mockCardRequest);

      // Assert
      expect(handlerMock.startTransaction).not.toHaveBeenCalled();
    });
  });
});
