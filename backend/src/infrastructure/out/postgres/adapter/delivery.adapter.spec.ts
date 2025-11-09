import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryAdapter } from './delivery.adapter';
import { DeliveryRepository } from '../repository/delivery.repository';
import { DeliveryEntity } from '../entity/delivery.entity';
import { Delivery } from 'domain/model/delivery.model';

describe('DeliveryAdapter', () => {
  let deliveryAdapter: DeliveryAdapter;
  let deliveryRepository: DeliveryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryAdapter,
        {
          provide: DeliveryRepository,
          useValue: {
            saveDelivery: jest.fn(),
          },
        },
      ],
    }).compile();

    deliveryAdapter = module.get<DeliveryAdapter>(DeliveryAdapter);
    deliveryRepository = module.get<DeliveryRepository>(DeliveryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(deliveryAdapter).toBeDefined();
    });

    it('should have repository injected', () => {
      expect(deliveryRepository).toBeDefined();
    });
  });

  describe('saveDelivery', () => {
    it('should save delivery successfully with all required fields', async () => {
      const delivery: Delivery = {
        address: '123 Main Street',
        country: 'USA',
        city: 'New York',
        region: 'NY',
        postalCode: '10001',
        destinataireName: 'John Doe',
      };

      const savedEntity: DeliveryEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        address: '123 Main Street',
        country: 'USA',
        city: 'New York',
        region: 'NY',
        postalCode: '10001',
        destinataireName: 'John Doe',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(deliveryRepository.saveDelivery).toHaveBeenCalledTimes(1);
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
      expect(result).toEqual(savedEntity);
    });

    it('should save delivery with optional fields included', async () => {
      const delivery: Delivery = {
        id: '456e7890-e89b-12d3-a456-426614174001',
        address: '456 Oak Avenue',
        country: 'Canada',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V 3A1',
        destinataireName: 'Jane Smith',
        fee: 15.99,
      };

      const savedEntity: DeliveryEntity = {
        id: '456e7890-e89b-12d3-a456-426614174001',
        address: '456 Oak Avenue',
        country: 'Canada',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V 3A1',
        destinataireName: 'Jane Smith',
        fee: 15.99,
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
      expect(result).toEqual(savedEntity);
      expect(result.fee).toBe(15.99);
      expect(result.id).toBe('456e7890-e89b-12d3-a456-426614174001');
    });

    it('should save delivery with fee as 0', async () => {
      const delivery: Delivery = {
        address: '789 Pine Street',
        country: 'UK',
        city: 'London',
        region: 'England',
        postalCode: 'SW1A 1AA',
        destinataireName: 'Bob Wilson',
        fee: 0,
      };

      const savedEntity: DeliveryEntity = {
        id: '789e1011-e89b-12d3-a456-426614174002',
        address: '789 Pine Street',
        country: 'UK',
        city: 'London',
        region: 'England',
        postalCode: 'SW1A 1AA',
        destinataireName: 'Bob Wilson',
        fee: 0,
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result.fee).toBe(0);
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should save delivery without fee field', async () => {
      const delivery: Delivery = {
        address: '321 Elm Street',
        country: 'Australia',
        city: 'Sydney',
        region: 'NSW',
        postalCode: '2000',
        destinataireName: 'Alice Johnson',
      };

      const savedEntity: DeliveryEntity = {
        id: '321e4567-e89b-12d3-a456-426614174003',
        address: '321 Elm Street',
        country: 'Australia',
        city: 'Sydney',
        region: 'NSW',
        postalCode: '2000',
        destinataireName: 'Alice Johnson',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result.fee).toBeUndefined();
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with special characters in address', async () => {
      const delivery: Delivery = {
        address: '123 Café Street, Apt #5-B',
        country: 'France',
        city: 'Paris',
        region: 'Île-de-France',
        postalCode: '75001',
        destinataireName: 'François Müller',
      };

      const savedEntity: DeliveryEntity = {
        id: '654e7890-e89b-12d3-a456-426614174004',
        address: '123 Café Street, Apt #5-B',
        country: 'France',
        city: 'Paris',
        region: 'Île-de-France',
        postalCode: '75001',
        destinataireName: 'François Müller',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result.address).toBe('123 Café Street, Apt #5-B');
      expect(result.destinataireName).toBe('François Müller');
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with long strings', async () => {
      const longAddress = 'A'.repeat(255);
      const longName = 'B'.repeat(100);
      
      const delivery: Delivery = {
        address: longAddress,
        country: 'Germany',
        city: 'Berlin',
        region: 'Brandenburg',
        postalCode: '10115',
        destinataireName: longName,
      };

      const savedEntity: DeliveryEntity = {
        id: '987e6543-e89b-12d3-a456-426614174005',
        address: longAddress,
        country: 'Germany',
        city: 'Berlin',
        region: 'Brandenburg',
        postalCode: '10115',
        destinataireName: longName,
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result.address).toBe(longAddress);
      expect(result.destinataireName).toBe(longName);
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle database connection error', async () => {
      const delivery: Delivery = {
        address: '123 Error Street',
        country: 'USA',
        city: 'Error City',
        region: 'ER',
        postalCode: '00000',
        destinataireName: 'Error User',
      };

      const error = new Error('Database connection failed');
      jest.spyOn(deliveryRepository, 'saveDelivery').mockRejectedValue(error);

      await expect(deliveryAdapter.saveDelivery(delivery)).rejects.toThrow(
        'Database connection failed'
      );
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle repository timeout error', async () => {
      const delivery: Delivery = {
        address: '456 Timeout Street',
        country: 'USA',
        city: 'Timeout City',
        region: 'TO',
        postalCode: '11111',
        destinataireName: 'Timeout User',
      };

      const timeoutError = new Error('Query timeout');
      jest.spyOn(deliveryRepository, 'saveDelivery').mockRejectedValue(timeoutError);

      await expect(deliveryAdapter.saveDelivery(delivery)).rejects.toThrow('Query timeout');
    });

    it('should handle constraint violation error', async () => {
      const delivery: Delivery = {
        address: '789 Constraint Street',
        country: 'USA',
        city: 'Constraint City',
        region: 'CO',
        postalCode: '22222',
        destinataireName: 'Constraint User',
      };

      const constraintError = new Error('UNIQUE constraint failed');
      jest.spyOn(deliveryRepository, 'saveDelivery').mockRejectedValue(constraintError);

      await expect(deliveryAdapter.saveDelivery(delivery)).rejects.toThrow(
        'UNIQUE constraint failed'
      );
    });

    it('should handle null return from repository', async () => {
      const delivery: Delivery = {
        address: '999 Null Street',
        country: 'USA',
        city: 'Null City',
        region: 'NU',
        postalCode: '99999',
        destinataireName: 'Null User',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(null);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result).toBeNull();
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle undefined return from repository', async () => {
      const delivery: Delivery = {
        address: '888 Undefined Street',
        country: 'USA',
        city: 'Undefined City',
        region: 'UN',
        postalCode: '88888',
        destinataireName: 'Undefined User',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(undefined);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result).toBeUndefined();
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should preserve all delivery properties when saving', async () => {
      const delivery: Delivery = {
        id: 'existing-id-123',
        address: '100 Property Street',
        country: 'Spain',
        city: 'Madrid',
        region: 'Madrid',
        postalCode: '28001',
        destinataireName: 'Carlos García',
        fee: 25.50,
      };

      const savedEntity: DeliveryEntity = {
        id: 'existing-id-123',
        address: '100 Property Street',
        country: 'Spain',
        city: 'Madrid',
        region: 'Madrid',
        postalCode: '28001',
        destinataireName: 'Carlos García',
        fee: 25.50,
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      const result = await deliveryAdapter.saveDelivery(delivery);

      expect(result).toMatchObject({
        id: 'existing-id-123',
        address: '100 Property Street',
        country: 'Spain',
        city: 'Madrid',
        region: 'Madrid',
        postalCode: '28001',
        destinataireName: 'Carlos García',
        fee: 25.50,
      });
    });

    it('should call repository exactly once per save operation', async () => {
      const delivery: Delivery = {
        address: '200 Single Call Street',
        country: 'Italy',
        city: 'Rome',
        region: 'Lazio',
        postalCode: '00100',
        destinataireName: 'Marco Rossi',
      };

      const savedEntity: DeliveryEntity = {
        id: 'call-count-test-id',
        address: '200 Single Call Street',
        country: 'Italy',
        city: 'Rome',
        region: 'Lazio',
        postalCode: '00100',
        destinataireName: 'Marco Rossi',
      };

      jest.spyOn(deliveryRepository, 'saveDelivery').mockResolvedValue(savedEntity);

      await deliveryAdapter.saveDelivery(delivery);

      expect(deliveryRepository.saveDelivery).toHaveBeenCalledTimes(1);
      expect(deliveryRepository.saveDelivery).toHaveBeenCalledWith(delivery);
    });
  });

  describe('implementation', () => {
    it('should implement DeliveryPersistencePort interface', () => {
      expect(deliveryAdapter.saveDelivery).toBeDefined();
      expect(typeof deliveryAdapter.saveDelivery).toBe('function');
    });

    it('should be injectable', () => {
      expect(deliveryAdapter).toBeInstanceOf(DeliveryAdapter);
    });
  });
});
