import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { WompiClient } from './wompi.client';
import configuration from 'src/infrastructure/out/postgres/config/configuration';
import { Card } from 'domain/model/card.model';
import { Acceptance } from 'domain/model/acceptance.model';
import { AcceptanceType } from 'domain/model/enum/acceptance.enum';
import { CreateTransactionWompiRequest } from '../dto/request/create.transaction.wompi.request';
import { CardTokenizationResponse } from '../dto/response/card.tokenization.response';
import { GetTransactionWompiResponse } from '../dto/response/get.transaction.wompi.response';

describe('WompiClient', () => {
  let wompiClient: WompiClient;
  let httpService: HttpService;
  let config: ConfigType<typeof configuration>;

  const mockConfig = {
    wompi: {
      apiUrl: 'https://api.wompi.test',
      publicKey: 'pub_test_12345',
      privateKey: 'prv_test_12345',
      eventKey: 'event_test_12345',
      integrityKey: 'integrity_test_12345',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiClient,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: configuration.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    wompiClient = module.get<WompiClient>(WompiClient);
    httpService = module.get<HttpService>(HttpService);
    config = module.get<ConfigType<typeof configuration>>(configuration.KEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAcceptancesContracts', () => {
    it('should return acceptance contracts successfully', async () => {
      const mockResponse = {
        data: {
          presigned_acceptance: {
            acceptanceToken: 'token1',
            permalink: 'https://wompi.com/acceptance1',
            type: AcceptanceType.END_USER_POLICY,
          },
          presigned_personal_data_auth: {
            acceptanceToken: 'token2',
            permalink: 'https://wompi.com/acceptance2',
            type: AcceptanceType.PERSONAL_DATA_AUTH,
          },
          other_field: 'not_presigned',
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await wompiClient.getAcceptancesContracts();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        acceptanceToken: 'token1',
        permalink: 'https://wompi.com/acceptance1',
        type: AcceptanceType.END_USER_POLICY,
      });
      expect(result[1]).toEqual({
        acceptanceToken: 'token2',
        permalink: 'https://wompi.com/acceptance2',
        type: AcceptanceType.PERSONAL_DATA_AUTH,
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockConfig.wompi.apiUrl}/merchants/${mockConfig.wompi.publicKey}`,
      );
    });

    it('should handle empty presigned contracts', async () => {
      const mockResponse = {
        data: {
          some_field: 'value',
          another_field: 'value2',
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await wompiClient.getAcceptancesContracts();

      expect(result).toEqual([]);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error when HTTP request fails', async () => {
      const axiosError = {
        message: 'Network Error',
        isAxiosError: true,
      } as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => axiosError));

      await expect(wompiClient.getAcceptancesContracts()).rejects.toThrow('Network Error');
    });
  });

  describe('tokenizeCard', () => {
    const mockCard: Card = {
      number: '4111111111111111',
      cvc: '123',
      expMont: '12',
      expYear: '2025',
      cardHolder: 'John Doe',
    };

    it('should tokenize card successfully', async () => {
      const mockResponse = {
        data: {
          status: 'CREATED',
          data: {
            id: 'tok_test_12345',
            created_at: '2024-01-01T00:00:00Z',
            brand: 'VISA',
            name: 'John Doe',
            last_four: '1111',
            bin: '411111',
            exp_year: '2025',
            exp_month: '12',
            card_holder: 'John Doe',
            created_with_cvc: true,
            expires_at: '2024-01-01T01:00:00Z',
            validity_ends_at: '2024-01-01T01:00:00Z',
          },
        },
      } as AxiosResponse<CardTokenizationResponse>;

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await wompiClient.tokenizeCard(mockCard);

      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockConfig.wompi.apiUrl}/tokens/cards`,
        {
          number: mockCard.number,
          cvc: mockCard.cvc,
          exp_month: mockCard.expMont,
          exp_year: mockCard.expYear,
          card_holder: mockCard.cardHolder,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockConfig.wompi.publicKey}`,
          },
        },
      );
    });

    it('should throw error when card tokenization fails', async () => {
      const axiosError = {
        message: 'Invalid card number',
        isAxiosError: true,
      } as AxiosError;

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => axiosError));

      await expect(wompiClient.tokenizeCard(mockCard)).rejects.toThrow('Invalid card number');
    });
  });

  describe('createTransaction', () => {
    const mockRequest: CreateTransactionWompiRequest = {
      acceptance_token: 'acc_test_12345',
      acceptance_personal_auth: 'auth_test_12345',
      amount_in_cents: 100000,
      currency: 'COP',
      signature: 'signature_test',
      customer_email: 'test@example.com',
      reference: 'ref_test_12345',
      payment_method: {
        type: 'CARD',
        token: 'tok_test_12345',
        installments: 1,
      },
      customer_data: {
        phone_number: '1234567890',
        full_name: 'John Doe',
        legal_id: '12345678',
        legal_id_type: 'CC',
      },
      shipping_address: {
        address_line_1: '123 Main St',
        address_line_2: 'Apt 4B',
        country: 'CO',
        region: 'Cundinamarca',
        city: 'Bogotá',
        name: 'John Doe',
        phone_number: '1234567890',
        postal_code: '110111',
      },
    };

    it('should create transaction successfully', async () => {
      const mockResponse = {
        data: mockRequest,
      } as AxiosResponse<CreateTransactionWompiRequest>;

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await wompiClient.createTransaction(mockRequest);

      expect(result).toEqual(mockRequest);
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockConfig.wompi.apiUrl}/tokens/cards`,
        mockRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockConfig.wompi.publicKey}`,
          },
        },
      );
    });

    it('should throw error when transaction creation fails', async () => {
      const axiosError = {
        message: 'Transaction failed',
        isAxiosError: true,
      } as AxiosError;

      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => axiosError));

      await expect(wompiClient.createTransaction(mockRequest)).rejects.toThrow('Transaction failed');
    });
  });

  describe('getTransaction', () => {
    const transactionId = 'txn_test_12345';

    it('should get transaction successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: transactionId,
            created_at: '2024-01-01T00:00:00Z',
            amount_in_cents: 100000,
            status: 'APPROVED',
            reference: 'ref_test_12345',
            customer_email: 'test@example.com',
            currency: 'COP',
            payment_method_type: 'CARD',
            payment_method: {
              type: 'CARD',
              token: 123456789,
              installments: 1,
            },
            shipping_address: {
              address_line_1: '123 Main St',
              country: 'CO',
              region: 'Cundinamarca',
              city: 'Bogotá',
              phone_number: 1234567890,
            },
          },
        },
      } as AxiosResponse<GetTransactionWompiResponse>;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await wompiClient.getTransaction(transactionId);

      expect(result).toEqual(mockResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockConfig.wompi.apiUrl}/transactions/${transactionId}`,
      );
    });

    it('should throw error when getting transaction fails', async () => {
      const axiosError = {
        message: 'Transaction not found',
        isAxiosError: true,
      } as AxiosError;

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => axiosError));

      await expect(wompiClient.getTransaction(transactionId)).rejects.toThrow('Transaction not found');
    });

    it('should handle different transaction IDs correctly', async () => {
      const differentTransactionId = 'txn_another_12345';
      const mockResponse = {
        data: {
          data: {
            id: differentTransactionId,
            created_at: '2024-01-02T00:00:00Z',
            amount_in_cents: 200000,
            status: 'PENDING',
            reference: 'ref_another_12345',
            customer_email: 'another@example.com',
            currency: 'COP',
            payment_method_type: 'CARD',
            payment_method: {
              type: 'CARD',
              token: 987654321,
              installments: 3,
            },
            shipping_address: {
              address_line_1: '456 Another St',
              country: 'CO',
              region: 'Antioquia',
              city: 'Medellín',
              phone_number: 9876543210,
            },
          },
        },
      } as AxiosResponse<GetTransactionWompiResponse>;

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await wompiClient.getTransaction(differentTransactionId);

      expect(result.data.id).toBe(differentTransactionId);
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockConfig.wompi.apiUrl}/transactions/${differentTransactionId}`,
      );
    });
  });
});
