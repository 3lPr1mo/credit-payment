import { Test, TestingModule } from '@nestjs/testing';
import { WompiServiceAdapter } from './wompi.service.adapter';
import { WompiClient } from '../api/wompi.client';
import { Acceptance } from 'domain/model/acceptance.model';
import { AcceptanceType } from 'domain/model/enum/acceptance.enum';
import { Card } from 'domain/model/card.model';
import { OrderTransaction } from 'domain/model/order.transaction.model';
import { Status } from 'domain/model/enum/status.enum';
import { CardTokenizationResponse } from '../dto/response/card.tokenization.response';
import { CreateTransactionWompiResponse } from '../dto/response/create.transaction.wompi.response';
import { CreateTransactionWompiRequest } from '../dto/request/create.transaction.wompi.request';
import configuration from 'src/infrastructure/out/postgres/config/configuration';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('mocked-signature-hash')
    })
  })
}));

describe('WompiServiceAdapter', () => {
  let service: WompiServiceAdapter;
  let wompiClient: jest.Mocked<WompiClient>;
  let configService: jest.Mocked<ConfigType<typeof configuration>>;

  const mockConfigService = {
    wompi: {
      apiUrl: 'https://api-test.wompi.dev/v1',
      publicKey: 'pub_test_key',
      integrityKey: 'test_integrity_key'
    }
  };

  const mockAcceptances: Acceptance[] = [
    {
      acceptanceToken: 'end_user_policy_token',
      permalink: 'https://wompi.com/end-user-policy',
      type: AcceptanceType.END_USER_POLICY
    },
    {
      acceptanceToken: 'personal_data_auth_token',
      permalink: 'https://wompi.com/personal-data-auth',
      type: AcceptanceType.PERSONAL_DATA_AUTH
    }
  ];

  const mockCard: Card = {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '12',
    expYear: '2025',
    cardHolder: 'John Doe'
  };

  const mockCardTokenizationResponse: CardTokenizationResponse = {
    status: 'CREATED',
    data: {
      id: 'tok_test_card_token_123',
      created_at: '2023-01-01T00:00:00.000Z',
      brand: 'VISA',
      name: 'VISA-4242',
      last_four: '4242',
      bin: '424242',
      exp_year: '2025',
      exp_month: '12',
      card_holder: 'John Doe',
      created_with_cvc: true,
      expires_at: '2024-01-01T00:00:00.000Z',
      validity_ends_at: '2024-01-01T00:00:00.000Z'
    }
  };

  const mockOrderTransaction: OrderTransaction = {
    id: 'order_123',
    quantity: 2,
    total: 100.50,
    product: {
      id: 'prod_123',
      name: 'Test Product',
      price: 50.25
    },
    customer: {
      id: 'cust_123',
      name: 'John',
      lastName: 'Doe',
      dni: '12345678',
      phone: '+573001234567',
      email: 'john.doe@example.com'
    },
    delivery: {
      id: 'del_123',
      address: '123 Main St',
      country: 'CO',
      city: 'Bogotá',
      region: 'Cundinamarca',
      postalCode: '110111',
      destinataireName: 'John Doe'
    },
    acceptanceEndUserPolicy: {
      acceptanceToken: 'end_user_policy_token',
      permalink: 'https://wompi.com/end-user-policy',
      type: AcceptanceType.END_USER_POLICY
    },
    acceptancePersonalDataAuthorization: {
      acceptanceToken: 'personal_data_auth_token',
      permalink: 'https://wompi.com/personal-data-auth',
      type: AcceptanceType.PERSONAL_DATA_AUTH
    }
  };

  const mockCreateTransactionResponse: CreateTransactionWompiResponse = {
    data: {
      id: 'trans_123',
      created_at: '2023-01-01T00:00:00.000Z',
      amount_in_cents: 10050,
      status: Status.APPROVED,
      reference: 'sk8-order_123',
      customer_email: 'john.doe@example.com',
      currency: 'COP',
      payment_method_type: 'CARD',
      payment_method: {
        type: 'CARD',
        phone_number: '+573001234567'
      },
      shipping_address: {
        address_line_1: '123 Main St',
        country: 'CO',
        region: 'Cundinamarca',
        city: 'Bogotá',
        phone_number: '+573001234567'
      }
    }
  };

  beforeEach(async () => {
    const mockWompiClient = {
      getAcceptancesContracts: jest.fn(),
      tokenizeCard: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiServiceAdapter,
        {
          provide: WompiClient,
          useValue: mockWompiClient
        },
        {
          provide: configuration.KEY,
          useValue: mockConfigService
        }
      ],
    }).compile();

    service = module.get<WompiServiceAdapter>(WompiServiceAdapter);
    wompiClient = module.get(WompiClient);
    configService = module.get(configuration.KEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAcceptances', () => {
    it('should return acceptances for both END_USER_POLICY and PERSONAL_DATA_AUTH', async () => {
      // Arrange
      wompiClient.getAcceptancesContracts.mockResolvedValue(mockAcceptances);

      // Act
      const result = await service.getAcceptances();

      // Assert
      expect(wompiClient.getAcceptancesContracts).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      
      const endUserPolicy = result.find(a => a.type === AcceptanceType.END_USER_POLICY);
      const personalDataAuth = result.find(a => a.type === AcceptanceType.PERSONAL_DATA_AUTH);
      
      expect(endUserPolicy).toEqual({
        acceptanceToken: 'end_user_policy_token',
        permalink: 'https://wompi.com/end-user-policy',
        type: AcceptanceType.END_USER_POLICY
      });
      
      expect(personalDataAuth).toEqual({
        acceptanceToken: 'personal_data_auth_token',
        permalink: 'https://wompi.com/personal-data-auth',
        type: AcceptanceType.PERSONAL_DATA_AUTH
      });
    });

    it('should handle acceptances array with different order', async () => {
      // Arrange
      const reversedAcceptances: Acceptance[] = [
        {
          acceptanceToken: 'personal_data_auth_token',
          permalink: 'https://wompi.com/personal-data-auth',
          type: AcceptanceType.PERSONAL_DATA_AUTH
        },
        {
          acceptanceToken: 'end_user_policy_token',
          permalink: 'https://wompi.com/end-user-policy',  
          type: AcceptanceType.END_USER_POLICY
        }
      ];
      wompiClient.getAcceptancesContracts.mockResolvedValue(reversedAcceptances);

      // Act
      const result = await service.getAcceptances();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.find(a => a.type === AcceptanceType.END_USER_POLICY)).toBeDefined();
      expect(result.find(a => a.type === AcceptanceType.PERSONAL_DATA_AUTH)).toBeDefined();
    });
  });

  describe('tokenizeCard', () => {
    it('should tokenize card successfully', async () => {
      // Arrange
      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);

      // Act
      const result = await service.tokenizeCard(mockCard);

      // Assert
      expect(wompiClient.tokenizeCard).toHaveBeenCalledWith(mockCard);
      expect(result).toEqual(mockCardTokenizationResponse);
    });
  });

  describe('pay', () => {

    it('should process payment successfully when transaction is approved immediately', async () => {
      // Arrange
      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(mockCreateTransactionResponse);

      // Act
      const result = await service.pay(mockOrderTransaction, mockCard);

      // Assert
      expect(wompiClient.tokenizeCard).toHaveBeenCalledWith(mockCard);
      
      // Verify signature creation
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      
      // Verify transaction creation request
      const expectedRequest: CreateTransactionWompiRequest = {
        acceptance_token: 'end_user_policy_token',
        acceptance_personal_auth: 'personal_data_auth_token',
        amount_in_cents: 10050,
        currency: 'COP',
        signature: 'mocked-signature-hash',
        customer_email: 'john.doe@example.com',
        reference: 'sk8-order_123',
        payment_method: {
          type: 'CARD',
          token: 'tok_test_card_token_123',
          installments: 1
        },
        customer_data: {
          phone_number: '+573001234567',
          full_name: 'John Doe',
          legal_id: '12345678',
          legal_id_type: 'CC'
        },
        shipping_address: {
          address_line_1: '123 Main St',
          country: 'CO',
          region: 'Cundinamarca',
          city: 'Bogotá',
          name: 'John Doe',
          phone_number: '+573001234567',
          postal_code: '110111'
        }
      };

      expect(wompiClient.createTransaction).toHaveBeenCalledWith(expectedRequest);
      expect(result).toEqual(mockCreateTransactionResponse);
    });

    it('should handle pending transaction with long-polling until approved', async () => {
      // Arrange
      const pendingResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.PENDING
        }
      };

      const approvedResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.APPROVED
        }
      };

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(pendingResponse);
      wompiClient.getTransaction.mockResolvedValue(approvedResponse);

      // Mock setTimeout to resolve immediately
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      // Act
      const result = await service.pay(mockOrderTransaction, mockCard);

      // Assert
      expect(wompiClient.getTransaction).toHaveBeenCalledWith('trans_123');
      expect(result).toEqual(approvedResponse);

      // Restore setTimeout
      setTimeoutSpy.mockRestore();
    });

    it('should handle pending transaction with multiple polling attempts', async () => {
      // Arrange
      const pendingResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.PENDING
        }
      };

      const stillPendingResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.PENDING
        }
      };

      const approvedResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.APPROVED
        }
      };

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(pendingResponse);
      wompiClient.getTransaction
        .mockResolvedValueOnce(stillPendingResponse)
        .mockResolvedValueOnce(approvedResponse);

      // Mock setTimeout to resolve immediately
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      // Act
      const result = await service.pay(mockOrderTransaction, mockCard);

      // Assert
      expect(wompiClient.getTransaction).toHaveBeenCalledTimes(2);
      expect(wompiClient.getTransaction).toHaveBeenCalledWith('trans_123');
      expect(result).toEqual(approvedResponse);

      // Restore setTimeout
      setTimeoutSpy.mockRestore();
    });

    it('should handle declined transaction', async () => {
      // Arrange
      const pendingResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.PENDING
        }
      };

      const declinedResponse: CreateTransactionWompiResponse = {
        ...mockCreateTransactionResponse,
        data: {
          ...mockCreateTransactionResponse.data,
          status: Status.DECLINED
        }
      };

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(pendingResponse);
      wompiClient.getTransaction.mockResolvedValue(declinedResponse);

      // Mock setTimeout to resolve immediately
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      // Act
      const result = await service.pay(mockOrderTransaction, mockCard);

      // Assert
      expect(result).toEqual(declinedResponse);
      expect(result.data.status).toBe(Status.DECLINED);

      // Restore setTimeout
      setTimeoutSpy.mockRestore();
    });

    it('should correctly calculate amount in cents', async () => {
      // Arrange
      const orderWithDecimalTotal: OrderTransaction = {
        ...mockOrderTransaction,
        total: 123.45
      };

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(mockCreateTransactionResponse);

      // Act
      await service.pay(orderWithDecimalTotal, mockCard);

      // Assert
      const createTransactionCall = wompiClient.createTransaction.mock.calls[0][0];
      expect(createTransactionCall.amount_in_cents).toBe(12345);
    });

    it('should handle amount conversion with Math.floor for decimal precision', async () => {
      // Arrange
      const orderWithPrecisionIssue: OrderTransaction = {
        ...mockOrderTransaction,
        total: 99.999 // This should become 9999 cents, not 10000
      };

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);  
      wompiClient.createTransaction.mockResolvedValue(mockCreateTransactionResponse);

      // Act
      await service.pay(orderWithPrecisionIssue, mockCard);

      // Assert
      const createTransactionCall = wompiClient.createTransaction.mock.calls[0][0];
      expect(createTransactionCall.amount_in_cents).toBe(9999);
    });

    it('should correctly generate signature', async () => {
      // Arrange
      const mockDigestInstance = {
        digest: jest.fn().mockReturnValue('test-signature-hash')
      };
      const mockHashInstance = {
        update: jest.fn().mockReturnValue(mockDigestInstance)
      };
      (crypto.createHash as jest.Mock).mockReturnValue(mockHashInstance);

      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(mockCreateTransactionResponse);

      // Act
      await service.pay(mockOrderTransaction, mockCard);

      // Assert
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHashInstance.update).toHaveBeenCalledWith('sk8-order_12310050COPtest_integrity_key');
      expect(mockDigestInstance.digest).toHaveBeenCalledWith('hex');

      const createTransactionCall = wompiClient.createTransaction.mock.calls[0][0];
      expect(createTransactionCall.signature).toBe('test-signature-hash');
    });

    it('should create correct reference format', async () => {
      // Arrange
      wompiClient.tokenizeCard.mockResolvedValue(mockCardTokenizationResponse);
      wompiClient.createTransaction.mockResolvedValue(mockCreateTransactionResponse);

      // Act
      await service.pay(mockOrderTransaction, mockCard);

      // Assert
      const createTransactionCall = wompiClient.createTransaction.mock.calls[0][0];
      expect(createTransactionCall.reference).toBe('sk8-order_123');
    });
  });
});
