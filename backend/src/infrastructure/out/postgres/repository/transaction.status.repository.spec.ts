import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatusRepository } from './transaction.status.repository';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';

describe('TransactionStatusRepository', () => {
  let transactionStatusRepository: TransactionStatusRepository;
  let repository: Repository<TransactionStatusEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionStatusRepository,
        {
          provide: getRepositoryToken(TransactionStatusEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionStatusRepository = module.get<TransactionStatusRepository>(TransactionStatusRepository);
    repository = module.get<Repository<TransactionStatusEntity>>(getRepositoryToken(TransactionStatusEntity));
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(transactionStatusRepository).toBeDefined();
    });

    it('should inject repository dependency', () => {
      expect(repository).toBeDefined();
    });
  });

  describe('findTransactionStatusByName', () => {
    it('should return transaction status entity when entity exists', async () => {
      const mockTransactionStatus: TransactionStatusEntity = {
        id: 1,
        name: 'PENDING',
        orderTransactions: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransactionStatus);

      const result = await transactionStatusRepository.findTransactionStatusByName('PENDING');

      expect(result).toEqual(mockTransactionStatus);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'PENDING' },
      });
    });

    it('should return null when transaction status does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await transactionStatusRepository.findTransactionStatusByName('NONEXISTENT');

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'NONEXISTENT' },
      });
    });

    it('should throw error when findOne fails', async () => {
      const error = new Error('Database connection error');
      jest.spyOn(repository, 'findOne').mockRejectedValue(error);

      await expect(
        transactionStatusRepository.findTransactionStatusByName('PENDING')
      ).rejects.toThrow('Database connection error');

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'PENDING' },
      });
    });

    it('should handle empty string parameter', async () => {
      const mockTransactionStatus: TransactionStatusEntity = {
        id: 2,
        name: '',
        orderTransactions: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransactionStatus);

      const result = await transactionStatusRepository.findTransactionStatusByName('');

      expect(result).toEqual(mockTransactionStatus);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: '' },
      });
    });

    it('should handle special characters in name parameter', async () => {
      const specialName = 'PENDING-STATUS_WITH.SPECIAL@CHARS';
      const mockTransactionStatus: TransactionStatusEntity = {
        id: 3,
        name: specialName,
        orderTransactions: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransactionStatus);

      const result = await transactionStatusRepository.findTransactionStatusByName(specialName);

      expect(result).toEqual(mockTransactionStatus);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: specialName },
      });
    });

    it('should handle case sensitive names', async () => {
      const mockTransactionStatus: TransactionStatusEntity = {
        id: 4,
        name: 'pending',
        orderTransactions: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransactionStatus);

      const result = await transactionStatusRepository.findTransactionStatusByName('pending');

      expect(result).toEqual(mockTransactionStatus);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'pending' },
      });
    });

    it('should return entity without relations when found', async () => {
      const mockTransactionStatus: TransactionStatusEntity = {
        id: 5,
        name: 'COMPLETED',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockTransactionStatus);

      const result = await transactionStatusRepository.findTransactionStatusByName('COMPLETED');

      expect(result).toEqual(mockTransactionStatus);
      expect(result.orderTransactions).toBeUndefined();
    });
  });
});
