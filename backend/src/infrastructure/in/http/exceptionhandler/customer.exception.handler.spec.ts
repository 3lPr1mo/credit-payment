import { BadRequestException, Logger } from '@nestjs/common';
import { CustomerExceptionHandler } from './customer.exception.handler';
import { CustomerAlreadyExistsException } from 'domain/exception/customer.already.exists.exception';
import { ExceptionConstant } from 'domain/constant/exception.constants';

describe('CustomerExceptionHandler', () => {
  let customerExceptionHandler: CustomerExceptionHandler;

  beforeEach(() => {
    customerExceptionHandler = new CustomerExceptionHandler();
    jest.spyOn(Logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCreateCustomer', () => {
    it('should throw BadRequestException when error is CustomerAlreadyExistsException', () => {
      const error = new CustomerAlreadyExistsException(
        ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE,
      );

      expect(() => customerExceptionHandler.handleCreateCustomer(error)).toThrow(
        BadRequestException,
      );
      expect(() => customerExceptionHandler.handleCreateCustomer(error)).toThrow(
        ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE,
      );
    });

    it('should not log error when error is CustomerAlreadyExistsException', () => {
      const error = new CustomerAlreadyExistsException(
        ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE,
      );

      try {
        customerExceptionHandler.handleCreateCustomer(error);
      } catch (e) {
        // Expected to throw
      }

      expect(Logger.error).not.toHaveBeenCalled();
    });

    it('should log error and throw original error when error is not CustomerAlreadyExistsException', () => {
      const error = new Error('Unexpected error');

      expect(() => customerExceptionHandler.handleCreateCustomer(error)).toThrow(error);
      expect(Logger.error).toHaveBeenCalledTimes(1);
      expect(Logger.error).toHaveBeenCalledWith(
        'Unexpected error',
        error.stack,
        CustomerAlreadyExistsException.name,
      );
    });

    it('should preserve error message when converting CustomerAlreadyExistsException', () => {
      const customMessage = 'Custom already exists message';
      const error = new CustomerAlreadyExistsException(customMessage);

      expect(() => customerExceptionHandler.handleCreateCustomer(error)).toThrow(
        BadRequestException,
      );
      expect(() => customerExceptionHandler.handleCreateCustomer(error)).toThrow(customMessage);
    });
  });
});

