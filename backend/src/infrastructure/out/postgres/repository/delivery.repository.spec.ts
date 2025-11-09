import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRepository } from './delivery.repository';
import { DeliveryEntity } from '../entity/delivery.entity';

describe('DeliveryRepository', () => {
  let deliveryRepository: DeliveryRepository;
  let repository: Repository<DeliveryEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryRepository,
        {
          provide: getRepositoryToken(DeliveryEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    deliveryRepository = module.get<DeliveryRepository>(DeliveryRepository);
    repository = module.get<Repository<DeliveryEntity>>(getRepositoryToken(DeliveryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDelivery', () => {
    it('should call save method with delivery entity', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '123 Main Street',
        country: 'United States',
        city: 'New York',
        region: 'NY',
        postalCode: '10001',
        destinataireName: 'John Doe',
        fee: 15.99,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntity as any);

      await deliveryRepository.saveDelivery(deliveryEntity);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(deliveryEntity);
    });

    it('should return the saved delivery entity', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        address: '456 Oak Avenue',
        country: 'Canada',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V 3A8',
        destinataireName: 'Jane Smith',
        fee: 12.50,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntity as any);

      const result = await deliveryRepository.saveDelivery(deliveryEntity);

      expect(result).toEqual(deliveryEntity);
    });

    it('should save delivery entity with null fee', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        address: '789 Pine Street',
        country: 'Mexico',
        city: 'Guadalajara',
        region: 'Jalisco',
        postalCode: '44100',
        destinataireName: 'Carlos Rodriguez',
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntity as any);

      const result = await deliveryRepository.saveDelivery(deliveryEntity);

      expect(repository.save).toHaveBeenCalledWith(deliveryEntity);
      expect(result).toEqual(deliveryEntity);
      expect(result.fee).toBeUndefined();
    });

    it('should save delivery entity without id (auto-generated)', async () => {
      const deliveryEntityInput: DeliveryEntity = {
        address: '101 Elm Street',
        country: 'United Kingdom',
        city: 'London',
        region: 'England',
        postalCode: 'SW1A 1AA',
        destinataireName: 'William Brown',
        fee: 20.00,
      };

      const deliveryEntitySaved: DeliveryEntity = {
        ...deliveryEntityInput,
        id: '550e8400-e29b-41d4-a716-446655440002',
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntitySaved as any);

      const result = await deliveryRepository.saveDelivery(deliveryEntityInput);

      expect(repository.save).toHaveBeenCalledWith(deliveryEntityInput);
      expect(result).toEqual(deliveryEntitySaved);
      expect(result.id).toBeDefined();
    });

    it('should handle delivery entity with zero fee', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        address: '202 Cedar Lane',
        country: 'Australia',
        city: 'Sydney',
        region: 'NSW',
        postalCode: '2000',
        destinataireName: 'Emily Johnson',
        fee: 0,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntity as any);

      const result = await deliveryRepository.saveDelivery(deliveryEntity);

      expect(repository.save).toHaveBeenCalledWith(deliveryEntity);
      expect(result).toEqual(deliveryEntity);
      expect(result.fee).toBe(0);
    });

    it('should handle delivery entity with decimal fee', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        address: '303 Maple Drive',
        country: 'Germany',
        city: 'Berlin',
        region: 'Brandenburg',
        postalCode: '10115',
        destinataireName: 'Hans Mueller',
        fee: 99.99,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(deliveryEntity as any);

      const result = await deliveryRepository.saveDelivery(deliveryEntity);

      expect(repository.save).toHaveBeenCalledWith(deliveryEntity);
      expect(result).toEqual(deliveryEntity);
      expect(result.fee).toBe(99.99);
    });

    it('should throw error when save fails', async () => {
      const deliveryEntity: DeliveryEntity = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        address: '404 Birch Boulevard',
        country: 'France',
        city: 'Paris',
        region: 'Île-de-France',
        postalCode: '75001',
        destinataireName: 'Marie Dubois',
        fee: 18.75,
      };

      const error = new Error('Database connection error');
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(deliveryRepository.saveDelivery(deliveryEntity)).rejects.toThrow('Database connection error');
      expect(repository.save).toHaveBeenCalledWith(deliveryEntity);
    });

    it('should throw error when save fails with network timeout', async () => {
      const deliveryEntity: DeliveryEntity = {
        address: '505 Willow Way',
        country: 'Spain',
        city: 'Madrid',
        region: 'Community of Madrid',
        postalCode: '28001',
        destinataireName: 'Antonio García',
        fee: 25.50,
      };

      const timeoutError = new Error('Connection timeout');
      jest.spyOn(repository, 'save').mockRejectedValue(timeoutError);

      await expect(deliveryRepository.saveDelivery(deliveryEntity)).rejects.toThrow('Connection timeout');
    });

    it('should throw error when save fails with constraint violation', async () => {
      const deliveryEntity: DeliveryEntity = {
        address: '606 Spruce Street',
        country: 'Italy',
        city: 'Rome',
        region: 'Lazio',
        postalCode: '00100',
        destinataireName: 'Giuseppe Rossi',
        fee: 14.20,
      };

      const constraintError = new Error('Constraint violation');
      jest.spyOn(repository, 'save').mockRejectedValue(constraintError);

      await expect(deliveryRepository.saveDelivery(deliveryEntity)).rejects.toThrow('Constraint violation');
    });
  });
});
