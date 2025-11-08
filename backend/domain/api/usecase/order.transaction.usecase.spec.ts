import { OrderTransactionUseCase } from './order.transaction.usecase';
import { OrderTransactionPersistencePort } from 'domain/spi/order.transaction.persistence.port';
import { ProductServicePort } from '../product.service.port';
import { CustomerServicePort } from '../customer.service.port';
import { DeliveryServicePort } from '../delivery.service.port';
import { TransactionStatusPersistencePort } from 'domain/spi/transaction.status.persistence.port';
import { WompiServicePort } from 'domain/spi/wompi.service.port';
import { OrderTransaction } from 'domain/model/order.transaction.model';
import { Card } from 'domain/model/card.model';
import { Customer } from 'domain/model/customer.model';
import { Product } from 'domain/model/product.model';
import { Delivery } from 'domain/model/delivery.model';
import { TransactionStatus } from 'domain/model/transaction.status.model';
import { Acceptance } from 'domain/model/acceptance.model';
import { Status } from 'domain/model/enum/status.enum';
import { AcceptanceType } from 'domain/model/enum/acceptance.enum';
import { ProductStockNotAvailableException } from 'domain/exception/product.stock.not.available.exception';
import { TransactionNotFoundException } from 'domain/exception/transaction.not.found.exception';
import { TransactionAlreadyFinishedException } from 'domain/exception/transaction.already.finished.exception';
import { ExceptionConstant } from 'domain/constant/exception.constants';
import { CreateTransactionWompiResponse } from 'src/infrastructure/out/external/wompi/dto/response/create.transaction.wompi.response';

describe('OrderTransactionUseCase', () => {
  let orderTransactionUseCase: OrderTransactionUseCase;
  let orderTransactionPersistencePort: jest.Mocked<OrderTransactionPersistencePort>;
  let productServicePort: jest.Mocked<ProductServicePort>;
  let customerServicePort: jest.Mocked<CustomerServicePort>;
  let deliveryServicePort: jest.Mocked<DeliveryServicePort>;
  let transactionStatusPersistencePort: jest.Mocked<TransactionStatusPersistencePort>;
  let wompiServicePort: jest.Mocked<WompiServicePort>;

  const mockOrderTransactionPersistencePort: OrderTransactionPersistencePort = {
    saveOrderTransaction: jest.fn(),
    findTransactionById: jest.fn(),
  };

  const mockProductServicePort: ProductServicePort = {
    getProducts: jest.fn(),
    seedProducts: jest.fn(),
    findProductById: jest.fn(),
    updateProductStock: jest.fn(),
  };

  const mockCustomerServicePort: CustomerServicePort = {
    createCustomer: jest.fn(),
    findCustomerByEmail: jest.fn(),
  };

  const mockDeliveryServicePort: DeliveryServicePort = {
    createDelivery: jest.fn(),
  };

  const mockTransactionStatusPersistencePort: TransactionStatusPersistencePort = {
    findTransactionStatusByName: jest.fn(),
  };

  const mockWompiServicePort: WompiServicePort = {
    getAcceptances: jest.fn(),
    tokenizeCard: jest.fn(),
    pay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    orderTransactionPersistencePort = mockOrderTransactionPersistencePort as jest.Mocked<OrderTransactionPersistencePort>;
    productServicePort = mockProductServicePort as jest.Mocked<ProductServicePort>;
    customerServicePort = mockCustomerServicePort as jest.Mocked<CustomerServicePort>;
    deliveryServicePort = mockDeliveryServicePort as jest.Mocked<DeliveryServicePort>;
    transactionStatusPersistencePort = mockTransactionStatusPersistencePort as jest.Mocked<TransactionStatusPersistencePort>;
    wompiServicePort = mockWompiServicePort as jest.Mocked<WompiServicePort>;

    orderTransactionUseCase = new OrderTransactionUseCase(
      orderTransactionPersistencePort,
      productServicePort,
      customerServicePort,
      deliveryServicePort,
      transactionStatusPersistencePort,
      wompiServicePort
    );
  });

  describe('startTransaction', () => {
    it('should create transaction with existing customer', async () => {
      const existingCustomer: Customer = {
        id: '123',
        name: 'John',
        lastName: 'Doe',
        dni: '12345678',
        phone: '123456789',
        email: 'john.doe@example.com',
      };

      const product: Product = {
        id: 'product-123',
        name: 'Test Product',
        price: 10000,
        stock: 10,
      };

      const delivery: Delivery = {
        address: 'Calle 123',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'John Doe',
      };

      const orderTransaction: OrderTransaction = {
        quantity: 2,
        product: { id: 'product-123' },
        delivery: delivery,
        customer: { email: 'john.doe@example.com' } as Customer,
      };

      const deliveryWithFee: Delivery = { ...delivery, id: 'delivery-123', fee: 5000 };
      const pendingStatus: TransactionStatus = { id: 1, name: Status.PENDING };
      const acceptances: Acceptance[] = [
        { acceptanceToken: 'token1', type: AcceptanceType.END_USER_POLICY },
        { acceptanceToken: 'token2', type: AcceptanceType.PERSONAL_DATA_AUTH },
      ];

      const savedTransaction: OrderTransaction = {
        ...orderTransaction,
        id: 'transaction-123',
        customer: existingCustomer,
        product: product,
        delivery: deliveryWithFee,
        total: 25000, // (10000 * 2) + 5000
        status: pendingStatus,
        acceptanceEndUserPolicy: acceptances[0],
        acceptancePersonalDataAuthorization: acceptances[1],
      };

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue(existingCustomer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);
      jest.spyOn(deliveryServicePort, 'createDelivery').mockResolvedValue(deliveryWithFee);
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue(pendingStatus);
      jest.spyOn(wompiServicePort, 'getAcceptances').mockResolvedValue(acceptances);
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(savedTransaction);

      const result = await orderTransactionUseCase.startTransaction(orderTransaction);

      expect(result).toEqual(savedTransaction);
      expect(customerServicePort.findCustomerByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(productServicePort.findProductById).toHaveBeenCalledWith('product-123');
      expect(deliveryServicePort.createDelivery).toHaveBeenCalled();
      expect(transactionStatusPersistencePort.findTransactionStatusByName).toHaveBeenCalledWith(Status.PENDING);
      expect(wompiServicePort.getAcceptances).toHaveBeenCalled();
      expect(orderTransactionPersistencePort.saveOrderTransaction).toHaveBeenCalled();
    });

    it('should create transaction with new customer when customer not found', async () => {
      const newCustomer: Customer = {
        name: 'Jane',
        lastName: 'Smith',
        dni: '87654321',
        phone: '987654321',
        email: 'jane.smith@example.com',
      };

      const createdCustomer: Customer = { ...newCustomer, id: '456' };

      const product: Product = {
        id: 'product-456',
        name: 'Test Product 2',
        price: 15000,
        stock: 5,
      };

      const orderTransaction: OrderTransaction = {
        quantity: 1,
        product: { id: 'product-456' },
        delivery: {
          address: 'Avenida 456',
          country: 'Colombia',
          city: 'Medellín',
          region: 'Antioquia',
          postalCode: '050001',
          destinataireName: 'Jane Smith',
        },
        customer: newCustomer,
      };

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue({} as Customer);
      jest.spyOn(customerServicePort, 'createCustomer').mockResolvedValue(createdCustomer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);
      jest.spyOn(deliveryServicePort, 'createDelivery').mockResolvedValue({ ...orderTransaction.delivery, id: 'delivery-456', fee: 8000 });
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue({ id: 1, name: Status.PENDING });
      jest.spyOn(wompiServicePort, 'getAcceptances').mockResolvedValue([]);
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(orderTransaction);

      await orderTransactionUseCase.startTransaction(orderTransaction);

      expect(customerServicePort.findCustomerByEmail).toHaveBeenCalledWith('jane.smith@example.com');
      expect(customerServicePort.createCustomer).toHaveBeenCalledWith(newCustomer);
    });

    it('should throw ProductStockNotAvailableException when insufficient stock', async () => {
      const customer: Customer = {
        id: '123',
        email: 'test@example.com',
      } as Customer;

      const product: Product = {
        id: 'product-123',
        stock: 1, // Insufficient stock
      };

      const orderTransaction: OrderTransaction = {
        quantity: 5, // More than available stock
        product: { id: 'product-123' },
        delivery: {} as Delivery,
        customer: customer,
      };

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue(customer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);

      await expect(orderTransactionUseCase.startTransaction(orderTransaction)).rejects.toThrow(
        ProductStockNotAvailableException
      );
      await expect(orderTransactionUseCase.startTransaction(orderTransaction)).rejects.toThrow(
        ExceptionConstant.PRODUCT_STOCK_NOT_AVAILABLE_MESSAGE
      );

      expect(customerServicePort.findCustomerByEmail).toHaveBeenCalled();
      expect(productServicePort.findProductById).toHaveBeenCalled();
    });

    it('should handle acceptances correctly when both types are found', async () => {
      const customer: Customer = { id: '123', email: 'test@example.com' } as Customer;
      const product: Product = { id: 'product-123', stock: 10, price: 10000 };
      const delivery: Delivery = {
        address: 'Test Address',
        country: 'Colombia',
        city: 'Test City',
        region: 'Test Region',
        postalCode: '000000',
        destinataireName: 'Test User',
      };

      const orderTransaction: OrderTransaction = {
        quantity: 1,
        product: { id: 'product-123' },
        delivery: delivery,
        customer: customer,
      };

      const acceptances: Acceptance[] = [
        { acceptanceToken: 'end-user-token', type: AcceptanceType.END_USER_POLICY },
        { acceptanceToken: 'personal-data-token', type: AcceptanceType.PERSONAL_DATA_AUTH },
      ];

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue(customer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);
      jest.spyOn(deliveryServicePort, 'createDelivery').mockResolvedValue({ ...delivery, id: 'delivery-123', fee: 5000 });
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue({ id: 1, name: Status.PENDING });
      jest.spyOn(wompiServicePort, 'getAcceptances').mockResolvedValue(acceptances);
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(orderTransaction);

      await orderTransactionUseCase.startTransaction(orderTransaction);

      expect(wompiServicePort.getAcceptances).toHaveBeenCalled();
      expect(orderTransaction.acceptanceEndUserPolicy).toEqual(acceptances[0]);
      expect(orderTransaction.acceptancePersonalDataAuthorization).toEqual(acceptances[1]);
    });

    it('should handle missing acceptances gracefully', async () => {
      const customer: Customer = { id: '123', email: 'test@example.com' } as Customer;
      const product: Product = { id: 'product-123', stock: 10, price: 10000 };
      const delivery: Delivery = {
        address: 'Test Address',
        country: 'Colombia',
        city: 'Test City',
        region: 'Test Region',
        postalCode: '000000',
        destinataireName: 'Test User',
      };

      const orderTransaction: OrderTransaction = {
        quantity: 1,
        product: { id: 'product-123' },
        delivery: delivery,
        customer: customer,
      };

      const acceptances: Acceptance[] = []; // No acceptances

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue(customer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);
      jest.spyOn(deliveryServicePort, 'createDelivery').mockResolvedValue({ ...delivery, id: 'delivery-123', fee: 5000 });
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue({ id: 1, name: Status.PENDING });
      jest.spyOn(wompiServicePort, 'getAcceptances').mockResolvedValue(acceptances);
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(orderTransaction);

      await orderTransactionUseCase.startTransaction(orderTransaction);

      expect(orderTransaction.acceptanceEndUserPolicy).toBeUndefined();
      expect(orderTransaction.acceptancePersonalDataAuthorization).toBeUndefined();
    });

    it('should calculate delivery fee and total correctly', async () => {
      const customer: Customer = { id: '123', email: 'test@example.com' } as Customer;
      const product: Product = { id: 'product-123', stock: 10, price: 20000 };
      const delivery: Delivery = {
        address: 'Test Address',
        country: 'Colombia',
        city: 'Test City',
        region: 'Test Region',
        postalCode: '000000',
        destinataireName: 'Test User',
      };

      const orderTransaction: OrderTransaction = {
        quantity: 3,
        product: { id: 'product-123' },
        delivery: delivery,
        customer: customer,
      };

      const deliveryWithFee: Delivery = { ...delivery, id: 'delivery-123', fee: 7500 };

      jest.spyOn(customerServicePort, 'findCustomerByEmail').mockResolvedValue(customer);
      jest.spyOn(productServicePort, 'findProductById').mockResolvedValue(product);
      jest.spyOn(deliveryServicePort, 'createDelivery').mockResolvedValue(deliveryWithFee);
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue({ id: 1, name: Status.PENDING });
      jest.spyOn(wompiServicePort, 'getAcceptances').mockResolvedValue([]);
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(orderTransaction);

      await orderTransactionUseCase.startTransaction(orderTransaction);

      // Total should be (20000 * 3) + 7500 = 67500
      expect(orderTransaction.total).toBe(67500);
      expect(orderTransaction.delivery.fee).toBe(7500);
    });
  });

  describe('findAllPendingTransactions', () => {
    it('should throw error as method is not implemented', async () => {
      await expect(orderTransactionUseCase.findAllPendingTransactions()).rejects.toThrow('Method not implemented.');
    });
  });

  describe('finishTransactionWithCard', () => {
    it('should throw TransactionNotFoundException when transaction not found', async () => {
      const transactionId = 'non-existent-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(null as any);

      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        TransactionNotFoundException
      );
      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        ExceptionConstant.TRANSACTION_NOT_FOUND_MESSAGE
      );

      expect(orderTransactionPersistencePort.findTransactionById).toHaveBeenCalledWith(transactionId);
    });

    it('should throw TransactionAlreadyFinishedException when transaction is not pending', async () => {
      const transactionId = 'finished-transaction-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const finishedTransaction: OrderTransaction = {
        id: transactionId,
        quantity: 1,
        product: { id: 'product-123' } as Product,
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 2, name: Status.APPROVED }, // Not pending
      };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(finishedTransaction);

      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        TransactionAlreadyFinishedException
      );
      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        ExceptionConstant.TRANSACTION_ALREADY_FINISHED_MESSAGE
      );

      expect(orderTransactionPersistencePort.findTransactionById).toHaveBeenCalledWith(transactionId);
    });

    it('should throw ProductStockNotAvailableException when product stock is insufficient at finish time', async () => {
      const transactionId = 'stock-issue-transaction-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const transaction: OrderTransaction = {
        id: transactionId,
        quantity: 10, // High quantity
        product: { id: 'product-123', stock: 2 } as Product, // Low stock
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 1, name: Status.PENDING },
      };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(transaction);

      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        ProductStockNotAvailableException
      );
      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow(
        ExceptionConstant.PRODUCT_STOCK_NOT_AVAILABLE_MESSAGE
      );
    });

    it('should complete transaction successfully with approved payment and update stock', async () => {
      const transactionId = 'success-transaction-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const transaction: OrderTransaction = {
        id: transactionId,
        quantity: 2,
        product: { id: 'product-123', stock: 10 } as Product,
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 1, name: Status.PENDING },
      };

      const paymentResult: CreateTransactionWompiResponse = {
        data: {
          id: 'wompi-transaction-123',
          status: Status.APPROVED,
        },
      } as CreateTransactionWompiResponse;

      const approvedStatus: TransactionStatus = { id: 2, name: Status.APPROVED };
      const updatedTransaction: OrderTransaction = {
        ...transaction,
        status: approvedStatus,
        paymentGatewayTransactionId: 'wompi-transaction-123',
      };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(transaction);
      jest.spyOn(wompiServicePort, 'pay').mockResolvedValue(paymentResult);
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue(approvedStatus);
      jest.spyOn(productServicePort, 'updateProductStock').mockResolvedValue();
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(updatedTransaction);

      const result = await orderTransactionUseCase.finishTransactionWithCard(transactionId, card);

      expect(result).toEqual(updatedTransaction);
      expect(wompiServicePort.pay).toHaveBeenCalledWith(transaction, card);
      expect(productServicePort.updateProductStock).toHaveBeenCalledWith('product-123', 2);
      expect(transactionStatusPersistencePort.findTransactionStatusByName).toHaveBeenCalledWith(Status.APPROVED);
      expect(orderTransactionPersistencePort.saveOrderTransaction).toHaveBeenCalledWith(updatedTransaction);
    });

    it('should complete transaction with rejected payment without updating stock', async () => {
      const transactionId = 'rejected-transaction-id';
      const card: Card = {
        number: '4000000000000002',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const transaction: OrderTransaction = {
        id: transactionId,
        quantity: 1,
        product: { id: 'product-456', stock: 5 } as Product,
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 1, name: Status.PENDING },
      };

      const paymentResult: CreateTransactionWompiResponse = {
        data: {
          id: 'wompi-transaction-456',
          status: Status.DECLINED,
        },
      } as CreateTransactionWompiResponse;

      const declinedStatus: TransactionStatus = { id: 3, name: Status.DECLINED };
      const updatedTransaction: OrderTransaction = {
        ...transaction,
        status: declinedStatus,
        paymentGatewayTransactionId: 'wompi-transaction-456',
      };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(transaction);
      jest.spyOn(wompiServicePort, 'pay').mockResolvedValue(paymentResult);
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue(declinedStatus);
      jest.spyOn(productServicePort, 'updateProductStock').mockResolvedValue();
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(updatedTransaction);

      const result = await orderTransactionUseCase.finishTransactionWithCard(transactionId, card);

      expect(result).toEqual(updatedTransaction);
      expect(wompiServicePort.pay).toHaveBeenCalledWith(transaction, card);
      expect(productServicePort.updateProductStock).not.toHaveBeenCalled(); // Should not update stock for declined payment
      expect(transactionStatusPersistencePort.findTransactionStatusByName).toHaveBeenCalledWith(Status.DECLINED);
    });

    it('should handle different payment statuses correctly', async () => {
      const transactionId = 'voided-transaction-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const transaction: OrderTransaction = {
        id: transactionId,
        quantity: 1,
        product: { id: 'product-789', stock: 3 } as Product,
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 1, name: Status.PENDING },
      };

      const paymentResult: CreateTransactionWompiResponse = {
        data: {
          id: 'wompi-transaction-789',
          status: Status.VOIDED,
        },
      } as CreateTransactionWompiResponse;

      const voidedStatus: TransactionStatus = { id: 4, name: Status.VOIDED };

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(transaction);
      jest.spyOn(wompiServicePort, 'pay').mockResolvedValue(paymentResult);
      jest.spyOn(transactionStatusPersistencePort, 'findTransactionStatusByName').mockResolvedValue(voidedStatus);
      jest.spyOn(productServicePort, 'updateProductStock').mockResolvedValue();
      jest.spyOn(orderTransactionPersistencePort, 'saveOrderTransaction').mockResolvedValue(transaction);

      await orderTransactionUseCase.finishTransactionWithCard(transactionId, card);

      expect(transactionStatusPersistencePort.findTransactionStatusByName).toHaveBeenCalledTimes(2); // Called twice due to line 74 and 81
      expect(productServicePort.updateProductStock).not.toHaveBeenCalled(); // Should not update stock for voided payment
    });

    it('should propagate payment processing errors', async () => {
      const transactionId = 'error-transaction-id';
      const card: Card = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User',
      };

      const transaction: OrderTransaction = {
        id: transactionId,
        quantity: 1,
        product: { id: 'product-error', stock: 5 } as Product,
        delivery: {} as Delivery,
        customer: {} as Customer,
        status: { id: 1, name: Status.PENDING },
      };

      const paymentError = new Error('Payment gateway error');

      jest.spyOn(orderTransactionPersistencePort, 'findTransactionById').mockResolvedValue(transaction);
      jest.spyOn(wompiServicePort, 'pay').mockRejectedValue(paymentError);

      await expect(orderTransactionUseCase.finishTransactionWithCard(transactionId, card)).rejects.toThrow('Payment gateway error');
      
      expect(wompiServicePort.pay).toHaveBeenCalledWith(transaction, card);
      expect(productServicePort.updateProductStock).not.toHaveBeenCalled();
      expect(orderTransactionPersistencePort.saveOrderTransaction).not.toHaveBeenCalled();
    });
  });
});
