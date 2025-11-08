import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { OrderTransactionExceptionHandler } from './order.transaction.exception.handler';
import { ProductStockNotAvailableException } from 'domain/exception/product.stock.not.available.exception';
import { TransactionAlreadyFinishedException } from 'domain/exception/transaction.already.finished.exception';
import { TransactionNotFoundException } from 'domain/exception/transaction.not.found.exception';

describe('OrderTransactionExceptionHandler', () => {
  let exceptionHandler: OrderTransactionExceptionHandler;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    exceptionHandler = new OrderTransactionExceptionHandler();
    // Mock Logger.error to avoid console spam and test logging behavior
    loggerSpy = jest.spyOn(Logger, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore Logger after each test
    loggerSpy.mockRestore();
  });

  describe('handleStartTransaction', () => {
    describe('TransactionAlreadyFinishedException handling', () => {
      it('should throw BadRequestException when TransactionAlreadyFinishedException is passed', () => {
        // Arrange
        const message = 'Transaction is already finished';
        const error = new TransactionAlreadyFinishedException(message);

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(BadRequestException);
      });

      it('should preserve the original error message when converting TransactionAlreadyFinishedException', () => {
        // Arrange
        const message = 'Transaction with ID 123 is already finished';
        const error = new TransactionAlreadyFinishedException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(BadRequestException);
          expect(thrownError.message).toBe(message);
        }
      });

      it('should handle TransactionAlreadyFinishedException with empty message', () => {
        // Arrange
        const error = new TransactionAlreadyFinishedException('');

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(BadRequestException);
      });

      it('should handle TransactionAlreadyFinishedException with special characters in message', () => {
        // Arrange
        const message = 'Transaction @123-456_789 is already finished! Cannot proceed.';
        const error = new TransactionAlreadyFinishedException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(BadRequestException);
          expect(thrownError.message).toBe(message);
        }
      });
    });

    describe('ProductStockNotAvailableException handling', () => {
      it('should throw BadRequestException when ProductStockNotAvailableException is passed', () => {
        // Arrange
        const message = 'Product stock is not available';
        const error = new ProductStockNotAvailableException(message);

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(BadRequestException);
      });

      it('should preserve the original error message when converting ProductStockNotAvailableException', () => {
        // Arrange
        const message = 'Product with ID 456 has insufficient stock: requested 10, available 3';
        const error = new ProductStockNotAvailableException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(BadRequestException);
          expect(thrownError.message).toBe(message);
        }
      });

      it('should handle ProductStockNotAvailableException with numeric values in message', () => {
        // Arrange
        const message = 'Requested quantity: 5, Available stock: 0';
        const error = new ProductStockNotAvailableException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(BadRequestException);
          expect(thrownError.message).toBe(message);
        }
      });

      it('should handle ProductStockNotAvailableException with long descriptive message', () => {
        // Arrange
        const message = 'The requested product "Laptop Dell XPS 15" with ID 550e8400-e29b-41d4-a716-446655440001 does not have sufficient stock available. Requested: 15 units, Available: 2 units. Please reduce the quantity or choose a different product.';
        const error = new ProductStockNotAvailableException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(BadRequestException);
          expect(thrownError.message).toBe(message);
        }
      });
    });

    describe('TransactionNotFoundException handling', () => {
      it('should throw NotFoundException when TransactionNotFoundException is passed', () => {
        // Arrange
        const message = 'Transaction not found';
        const error = new TransactionNotFoundException(message);

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(NotFoundException);
      });

      it('should preserve the original error message when converting TransactionNotFoundException', () => {
        // Arrange
        const message = 'Transaction with ID 789 not found';
        const error = new TransactionNotFoundException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(NotFoundException);
          expect(thrownError.message).toBe(message);
        }
      });

      it('should handle TransactionNotFoundException with UUID in message', () => {
        // Arrange
        const message = 'Transaction with ID 550e8400-e29b-41d4-a716-446655440999 not found in database';
        const error = new TransactionNotFoundException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(NotFoundException);
          expect(thrownError.message).toBe(message);
        }
      });

      it('should handle TransactionNotFoundException with null or undefined reference in message', () => {
        // Arrange
        const message = 'Transaction ID cannot be null or undefined';
        const error = new TransactionNotFoundException(message);

        // Act & Assert
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch (thrownError) {
          expect(thrownError).toBeInstanceOf(NotFoundException);
          expect(thrownError.message).toBe(message);
        }
      });
    });

    describe('Generic error handling', () => {
      it('should log error and rethrow when an unknown error type is passed', () => {
        // Arrange
        const message = 'Unexpected database connection error';
        const error = new Error(message);
        error.stack = 'Error: Unexpected database connection error\n    at Test.fn';

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy).toHaveBeenCalledWith(
          'Unexpected error',
          error.stack,
          OrderTransactionExceptionHandler.name
        );
      });

      it('should handle generic error with no stack trace', () => {
        // Arrange
        const message = 'Unknown error without stack';
        const error = new Error(message);
        delete error.stack; // Remove stack trace

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledWith(
          'Unexpected error',
          undefined,
          OrderTransactionExceptionHandler.name
        );
      });

      it('should handle custom error class that does not extend domain exceptions', () => {
        // Arrange
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
            this.name = 'CustomError';
          }
        }
        const error = new CustomError('This is a custom error');

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle TypeError as generic error', () => {
        // Arrange
        const error = new TypeError('Cannot read property of undefined');

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle ReferenceError as generic error', () => {
        // Arrange
        const error = new ReferenceError('someVariable is not defined');

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledTimes(1);
      });

      it('should handle SyntaxError as generic error', () => {
        // Arrange
        const error = new SyntaxError('Unexpected token');

        // Act & Assert
        expect(() => exceptionHandler.handleStartTransaction(error))
          .toThrow(error);
        
        expect(loggerSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Error message preservation and integrity', () => {
      it('should not modify the original error object when handling domain exceptions', () => {
        // Arrange
        const originalMessage = 'Original exception message';
        const error = new TransactionNotFoundException(originalMessage);
        const originalStack = error.stack;
        const originalName = error.name;

        // Act
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch {
          // Expected to throw
        }

        // Assert - Original error should remain unchanged
        expect(error.message).toBe(originalMessage);
        expect(error.stack).toBe(originalStack);
        expect(error.name).toBe(originalName);
      });

      it('should not modify the original error object when handling generic errors', () => {
        // Arrange
        const originalMessage = 'Generic error message';
        const error = new Error(originalMessage);
        const originalStack = error.stack;
        const originalName = error.name;

        // Act
        try {
          exceptionHandler.handleStartTransaction(error);
        } catch {
          // Expected to throw
        }

        // Assert - Original error should remain unchanged
        expect(error.message).toBe(originalMessage);
        expect(error.stack).toBe(originalStack);
        expect(error.name).toBe(originalName);
      });
    });

    describe('Exception hierarchy and instanceof checks', () => {
      it('should correctly identify TransactionAlreadyFinishedException using instanceof', () => {
        // Arrange
        const error = new TransactionAlreadyFinishedException('Test message');

        // Assert
        expect(error instanceof TransactionAlreadyFinishedException).toBe(true);
        expect(error instanceof Error).toBe(true);
        expect(error instanceof ProductStockNotAvailableException).toBe(false);
        expect(error instanceof TransactionNotFoundException).toBe(false);
      });

      it('should correctly identify ProductStockNotAvailableException using instanceof', () => {
        // Arrange
        const error = new ProductStockNotAvailableException('Test message');

        // Assert
        expect(error instanceof ProductStockNotAvailableException).toBe(true);
        expect(error instanceof Error).toBe(true);
        expect(error instanceof TransactionAlreadyFinishedException).toBe(false);
        expect(error instanceof TransactionNotFoundException).toBe(false);
      });

      it('should correctly identify TransactionNotFoundException using instanceof', () => {
        // Arrange
        const error = new TransactionNotFoundException('Test message');

        // Assert
        expect(error instanceof TransactionNotFoundException).toBe(true);
        expect(error instanceof Error).toBe(true);
        expect(error instanceof TransactionAlreadyFinishedException).toBe(false);
        expect(error instanceof ProductStockNotAvailableException).toBe(false);
      });
    });
  });

  describe('OrderTransactionExceptionHandler instantiation', () => {
    it('should create an instance of OrderTransactionExceptionHandler', () => {
      // Act
      const handler = new OrderTransactionExceptionHandler();

      // Assert
      expect(handler).toBeInstanceOf(OrderTransactionExceptionHandler);
      expect(handler).toBeDefined();
    });

    it('should have handleStartTransaction method', () => {
      // Act
      const handler = new OrderTransactionExceptionHandler();

      // Assert
      expect(handler.handleStartTransaction).toBeDefined();
      expect(typeof handler.handleStartTransaction).toBe('function');
    });
  });

  describe('Logger integration', () => {
    it('should use the correct logger context when logging errors', () => {
      // Arrange
      const error = new Error('Test error for logging');

      // Act
      try {
        exceptionHandler.handleStartTransaction(error);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        'Unexpected error',
        expect.any(String),
        'OrderTransactionExceptionHandler'
      );
    });

    it('should not call logger for domain exceptions', () => {
      // Arrange
      const error = new TransactionNotFoundException('Test message');

      // Act
      try {
        exceptionHandler.handleStartTransaction(error);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('should call logger exactly once for generic errors', () => {
      // Arrange
      const error = new Error('Generic error');

      // Act
      try {
        exceptionHandler.handleStartTransaction(error);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(loggerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
