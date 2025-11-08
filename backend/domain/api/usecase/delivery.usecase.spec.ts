import { DeliveryUseCase } from './delivery.usecase';
import { DeliveryPersistencePort } from 'domain/spi/delivery.persistence.port';
import { Delivery } from 'domain/model/delivery.model';

describe('DeliveryUseCase', () => {
  let deliveryUseCase: DeliveryUseCase;
  let deliveryPersistencePort: jest.Mocked<DeliveryPersistencePort>;

  const mockDeliveryPersistencePort: DeliveryPersistencePort = {
    saveDelivery: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deliveryPersistencePort = mockDeliveryPersistencePort as jest.Mocked<DeliveryPersistencePort>;
    deliveryUseCase = new DeliveryUseCase(deliveryPersistencePort);
  });

  describe('createDelivery', () => {
    it('should save delivery and return the saved delivery', async () => {
      const delivery: Delivery = {
        address: 'Calle 123 #45-67',
        country: 'Colombia',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        destinataireName: 'Juan Carlos García',
      };

      const savedDelivery: Delivery = {
        ...delivery,
        id: '123e4567-e89b-12d3-a456-426614174000',
        fee: 5000,
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledTimes(1);
    });

    it('should handle delivery with existing id and fee', async () => {
      const delivery: Delivery = {
        id: '456e7890-e12b-34d5-a678-901234567890',
        address: 'Avenida 456 #78-90',
        country: 'Colombia',
        city: 'Medellín',
        region: 'Antioquia',
        postalCode: '050001',
        destinataireName: 'María Fernanda López',
        fee: 8000,
      };

      const savedDelivery: Delivery = {
        ...delivery,
        fee: 8500, // Updated fee from persistence layer
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with special characters and international data', async () => {
      const delivery: Delivery = {
        address: 'Rúa da Conceição, 123 - Apt° 45',
        country: 'Brasil',
        city: 'São Paulo',
        region: 'São Paulo',
        postalCode: '01234-567',
        destinataireName: 'José María da Silva-Santos',
      };

      const savedDelivery: Delivery = {
        ...delivery,
        id: '789a0123-b45c-67d8-e901-234567890123',
        fee: 12000,
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with long address and names', async () => {
      const delivery: Delivery = {
        address: 'Carrera 123 Bis A #45-67 Interior 8, Apartamento 304, Conjunto Residencial Los Rosales, Urbanización Villa del Río',
        country: 'Colombia',
        city: 'Barranquilla',
        region: 'Atlántico',
        postalCode: '080001',
        destinataireName: 'Ana María Alejandra González-Pérez de la Torre y Mendoza',
      };

      const savedDelivery: Delivery = {
        ...delivery,
        id: '321e4567-890a-bcde-f123-456789012345',
        fee: 15000,
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with minimum required fields', async () => {
      const delivery: Delivery = {
        address: 'Calle 1',
        country: 'CO',
        city: 'B',
        region: 'C',
        postalCode: '1',
        destinataireName: 'A',
      };

      const savedDelivery: Delivery = {
        ...delivery,
        id: '111e2222-3333-4444-5555-666677778888',
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle delivery with zero fee', async () => {
      const delivery: Delivery = {
        address: 'Calle 789 #01-23',
        country: 'Colombia',
        city: 'Cali',
        region: 'Valle del Cauca',
        postalCode: '760001',
        destinataireName: 'Pedro Antonio Ramírez',
        fee: 0,
      };

      const savedDelivery: Delivery = {
        ...delivery,
        id: '999e8888-7777-6666-5555-444433332222',
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toEqual(savedDelivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should propagate errors from persistence layer', async () => {
      const delivery: Delivery = {
        address: 'Error Street 404',
        country: 'Colombia',
        city: 'Error City',
        region: 'Error Region',
        postalCode: '000000',
        destinataireName: 'Error User',
      };

      const error = new Error('Database connection failed');
      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockRejectedValue(error);

      await expect(deliveryUseCase.createDelivery(delivery)).rejects.toThrow('Database connection failed');
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledTimes(1);
    });

    it('should handle network timeout errors', async () => {
      const delivery: Delivery = {
        address: 'Timeout Street 503',
        country: 'Colombia',
        city: 'Timeout City',
        region: 'Timeout Region',
        postalCode: '503503',
        destinataireName: 'Timeout User',
      };

      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';
      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockRejectedValue(timeoutError);

      await expect(deliveryUseCase.createDelivery(delivery)).rejects.toThrow('Connection timeout');
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should handle validation errors from persistence layer', async () => {
      const delivery: Delivery = {
        address: 'Invalid Street',
        country: 'InvalidCountry',
        city: 'InvalidCity',
        region: 'InvalidRegion', 
        postalCode: 'INVALID',
        destinataireName: 'Invalid User',
      };

      const validationError = new Error('Invalid postal code format');
      validationError.name = 'ValidationError';
      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockRejectedValue(validationError);

      await expect(deliveryUseCase.createDelivery(delivery)).rejects.toThrow('Invalid postal code format');
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });

    it('should return exact object structure from persistence layer', async () => {
      const delivery: Delivery = {
        address: 'Structure Test Street',
        country: 'Colombia',
        city: 'Structure City',
        region: 'Structure Region',
        postalCode: '123456',
        destinataireName: 'Structure User',
      };

      const savedDelivery: Delivery = {
        id: 'abc123def456ghi789',
        address: delivery.address,
        country: delivery.country,
        city: delivery.city,
        region: delivery.region,
        postalCode: delivery.postalCode,
        destinataireName: delivery.destinataireName,
        fee: 7500,
      };

      jest.spyOn(deliveryPersistencePort, 'saveDelivery').mockResolvedValue(savedDelivery);

      const result = await deliveryUseCase.createDelivery(delivery);

      expect(result).toBe(savedDelivery); // Check reference equality
      expect(result).toEqual(savedDelivery); // Check value equality
      expect(result.id).toBe('abc123def456ghi789');
      expect(result.fee).toBe(7500);
      expect(deliveryPersistencePort.saveDelivery).toHaveBeenCalledWith(delivery);
    });
  });
});
