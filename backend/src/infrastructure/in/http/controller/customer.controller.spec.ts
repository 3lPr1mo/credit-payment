import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CustomerHandler } from 'application/handler/customer.handler';
import { CustomerExceptionHandler } from '../exceptionhandler/customer.exception.handler';
import { CreateCustomerRequest } from 'application/dto/request/create.customer.request';
import { CustomerAlreadyExistsException } from 'domain/exception/customer.already.exists.exception';
import { BadRequestException } from '@nestjs/common';

describe('CustomerController', () => {
  let customerController: CustomerController;
  let customerHandler: CustomerHandler;
  let customerExceptionHandler: CustomerExceptionHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerHandler,
          useValue: {
            createCustomer: jest.fn(),
          },
        },
        {
          provide: CustomerExceptionHandler,
          useValue: {
            handleCreateCustomer: jest.fn(),
          },
        },
      ],
    }).compile();

    customerController = module.get<CustomerController>(CustomerController);
    customerHandler = module.get<CustomerHandler>(CustomerHandler);
    customerExceptionHandler = module.get<CustomerExceptionHandler>(
      CustomerExceptionHandler,
    );
  });

  describe('creatCustomer', () => {
    it('should create customer successfully when handler succeeds', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerHandler, 'createCustomer').mockResolvedValue();

      await customerController.creatCustomer(customerRequest);

      expect(customerHandler.createCustomer).toHaveBeenCalledTimes(1);
      expect(customerHandler.createCustomer).toHaveBeenCalledWith(customerRequest);
    });

    it('should handle CustomerAlreadyExistsException through exception handler', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      const error = new CustomerAlreadyExistsException('Customer already exists');
      jest.spyOn(customerHandler, 'createCustomer').mockRejectedValue(error);
      jest
        .spyOn(customerExceptionHandler, 'handleCreateCustomer')
        .mockImplementation(() => {
          throw new BadRequestException(error.message);
        });

      await expect(
        customerController.creatCustomer(customerRequest),
      ).rejects.toThrow(BadRequestException);
      expect(customerExceptionHandler.handleCreateCustomer).toHaveBeenCalledWith(error);
    });

    it('should return void when customer creation is successful', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      jest.spyOn(customerHandler, 'createCustomer').mockResolvedValue();

      const result = await customerController.creatCustomer(customerRequest);

      expect(result).toBeUndefined();
    });

    it('should handle unexpected errors through exception handler', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      const unexpectedError = new Error('Database connection failed');
      jest.spyOn(customerHandler, 'createCustomer').mockRejectedValue(unexpectedError);
      jest
        .spyOn(customerExceptionHandler, 'handleCreateCustomer')
        .mockImplementation(() => {
          throw unexpectedError;
        });

      await expect(customerController.creatCustomer(customerRequest)).rejects.toThrow(
        'Database connection failed',
      );
      expect(customerExceptionHandler.handleCreateCustomer).toHaveBeenCalledWith(
        unexpectedError,
      );
      expect(customerExceptionHandler.handleCreateCustomer).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors through exception handler', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'Test',
        lastName: 'User',
        dni: '11111111',
        phone: '111111111',
        email: 'test.user@example.com',
      };

      const validationError = new TypeError('Invalid email format');
      jest.spyOn(customerHandler, 'createCustomer').mockRejectedValue(validationError);
      jest
        .spyOn(customerExceptionHandler, 'handleCreateCustomer')
        .mockImplementation(() => {
          throw validationError;
        });

      await expect(customerController.creatCustomer(customerRequest)).rejects.toThrow(TypeError);
      expect(customerExceptionHandler.handleCreateCustomer).toHaveBeenCalledWith(validationError);
    });

    it('should pass exact error instance to exception handler', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'Error',
        lastName: 'Test',
        dni: '99999999',
        phone: '999999999',
        email: 'error.test@example.com',
      };

      const specificError = new CustomerAlreadyExistsException('Specific customer exists message');
      jest.spyOn(customerHandler, 'createCustomer').mockRejectedValue(specificError);
      jest
        .spyOn(customerExceptionHandler, 'handleCreateCustomer')
        .mockImplementation(() => {
          throw new BadRequestException(specificError.message);
        });

      await expect(customerController.creatCustomer(customerRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(customerExceptionHandler.handleCreateCustomer).toHaveBeenCalledWith(specificError);
      expect(customerHandler.createCustomer).toHaveBeenCalledWith(customerRequest);
    });

    it('should handle different request data correctly', async () => {
      const customerRequest: CreateCustomerRequest = {
        name: 'María José',
        lastName: 'González Pérez',
        dni: '12345678901',
        phone: '+57-300-123-4567',
        email: 'maria.gonzalez@empresa.co',
      };

      jest.spyOn(customerHandler, 'createCustomer').mockResolvedValue();

      const result = await customerController.creatCustomer(customerRequest);

      expect(customerHandler.createCustomer).toHaveBeenCalledWith(customerRequest);
      expect(result).toBeUndefined();
    });
  });
});

