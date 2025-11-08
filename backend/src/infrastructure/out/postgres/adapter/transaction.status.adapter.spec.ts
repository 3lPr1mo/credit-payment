import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatusAdapter } from './transaction.status.adapter';
import { TransactionStatusRepository } from '../repository/transaction.status.repository';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { TransactionStatus } from 'domain/model/transaction.status.model';
import { Status } from 'domain/model/enum/status.enum';

describe('TransactionStatusAdapter', () => {
  let transactionStatusAdapter: TransactionStatusAdapter;
  let transactionStatusRepository: TransactionStatusRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionStatusAdapter,
        {
          provide: TransactionStatusRepository,
          useValue: {
            findTransactionStatusByName: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionStatusAdapter = module.get<TransactionStatusAdapter>(TransactionStatusAdapter);
    transactionStatusRepository = module.get<TransactionStatusRepository>(TransactionStatusRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findTransactionStatusByName', () => {
    it('should return transaction status when status PENDING is found', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(result).toEqual({
        id: 1,
        name: Status.PENDING,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('PENDING');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should return transaction status when status APPROVED is found', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 2,
        name: 'APPROVED',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('APPROVED');

      expect(result).toEqual({
        id: 2,
        name: Status.APPROVED,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('APPROVED');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should return transaction status when status DECLINED is found', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 3,
        name: 'DECLINED',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('DECLINED');

      expect(result).toEqual({
        id: 3,
        name: Status.DECLINED,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('DECLINED');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should return transaction status when status VOIDED is found', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 4,
        name: 'VOIDED',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('VOIDED');

      expect(result).toEqual({
        id: 4,
        name: Status.VOIDED,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('VOIDED');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should return transaction status when status ERROR is found', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 5,
        name: 'ERROR',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('ERROR');

      expect(result).toEqual({
        id: 5,
        name: Status.ERROR,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('ERROR');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should return transaction status without id when entity id is undefined', async () => {
      const mockEntity: TransactionStatusEntity = {
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(result).toEqual({
        id: undefined,
        name: Status.PENDING,
      });
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('PENDING');
    });

    it('should correctly map entity to model with all properties', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'APPROVED',
        orderTransactions: [],
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('APPROVED');

      // Verificar que solo se mapeen las propiedades del modelo, no las relaciones
      expect(result).toEqual({
        id: 1,
        name: Status.APPROVED,
      });
      expect(result).not.toHaveProperty('orderTransactions');
    });

    it('should handle repository errors when finding transaction status', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockRejectedValue(error);

      await expect(
        transactionStatusAdapter.findTransactionStatusByName('PENDING')
      ).rejects.toThrow('Database connection failed');
      
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('PENDING');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledTimes(1);
    });

    it('should handle database timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockRejectedValue(timeoutError);

      await expect(
        transactionStatusAdapter.findTransactionStatusByName('APPROVED')
      ).rejects.toThrow('Query timeout');
    });

    it('should handle null response from repository', async () => {
      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(null);

      await expect(
        transactionStatusAdapter.findTransactionStatusByName('NONEXISTENT')
      ).rejects.toThrow();
      
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('NONEXISTENT');
    });

    it('should handle undefined response from repository', async () => {
      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(undefined);

      await expect(
        transactionStatusAdapter.findTransactionStatusByName('NONEXISTENT')
      ).rejects.toThrow();
    });

    it('should correctly cast string name to Status enum type', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result: TransactionStatus = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(typeof result.name).toBe('string');
      expect(result.name).toBe(Status.PENDING);
      expect(Object.values(Status)).toContain(result.name);
    });

    it('should pass exact parameter to repository without modification', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const testName = 'PENDING';
      await transactionStatusAdapter.findTransactionStatusByName(testName);

      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith(testName);
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('PENDING');
    });

    it('should handle empty string parameter', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: '',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName('');

      expect(result.name).toBe('');
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith('');
    });

    it('should handle special characters in parameter', async () => {
      const specialName = 'STATUS_WITH-SPECIAL.CHARS';
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: specialName,
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName(specialName);

      expect(result.name).toBe(specialName);
      expect(transactionStatusRepository.findTransactionStatusByName).toHaveBeenCalledWith(specialName);
    });

    it('should maintain reference integrity - result should not be the same object as entity', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      // El resultado debe ser un objeto diferente (nuevo objeto creado en el adapter)
      expect(result).not.toBe(mockEntity);
      expect(result.id).toBe(mockEntity.id);
      expect(result.name).toBe(mockEntity.name);
    });

    it('should work correctly with id as number 0', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 0,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(result).toEqual({
        id: 0,
        name: Status.PENDING,
      });
    });

    it('should work correctly with negative id numbers', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: -1,
        name: 'ERROR',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName('ERROR');

      expect(result).toEqual({
        id: -1,
        name: Status.ERROR,
      });
    });
  });

  describe('Constructor and Dependencies', () => {
    it('should be defined', () => {
      expect(transactionStatusAdapter).toBeDefined();
    });

    it('should have repository injected', () => {
      expect(transactionStatusRepository).toBeDefined();
    });

    it('should implement TransactionStatusPersistencePort', () => {
      expect(transactionStatusAdapter).toHaveProperty('findTransactionStatusByName');
      expect(typeof transactionStatusAdapter.findTransactionStatusByName).toBe('function');
    });
  });

  describe('Method Signatures', () => {
    it('should have correct return type for findTransactionStatusByName', async () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = await transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(typeof result.id).toBe('number');
      expect(typeof result.name).toBe('string');
    });

    it('should return a Promise', () => {
      const mockEntity: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
      };

      jest.spyOn(transactionStatusRepository, 'findTransactionStatusByName').mockResolvedValue(mockEntity);

      const result = transactionStatusAdapter.findTransactionStatusByName('PENDING');

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
