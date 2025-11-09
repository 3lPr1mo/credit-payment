import { Test, TestingModule } from '@nestjs/testing';
import { ProductHandler } from './product.handler';
import { ProductServicePort } from '../../domain/api/product.service.port';
import { Product } from '../../domain/model/product.model';
import { GetProductReponse } from '../dto/response/get.product.response';
import { seedProducts } from '../../domain/seed/product.seed';

describe('ProductHandler', () => {
  let productHandler: ProductHandler;
  let productServicePort: ProductServicePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductHandler,
        {
          provide: 'ProductUseCase',
          useValue: {
            getProducts: jest.fn(),
            seedProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    productHandler = module.get<ProductHandler>(ProductHandler);
    productServicePort = module.get<ProductServicePort>('ProductUseCase');
  });

  describe('getProduct', () => {
    it('should return mapped products when products exist', async () => {
      const products: Product[] = seedProducts(3);
      jest.spyOn(productServicePort, 'getProducts').mockResolvedValue(products);

      const result = await productHandler.getProducts();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: products[0].id,
        name: products[0].name,
        description: products[0].description,
        price: products[0].price,
        stock: products[0].stock,
        image: products[0].image,
      });
      expect(productServicePort.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products exist', async () => {
      jest.spyOn(productServicePort, 'getProducts').mockResolvedValue([]);

      const result = await productHandler.getProducts();

      expect(result).toEqual([]);
      expect(productServicePort.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should map all product fields correctly', async () => {
      const product: Product = {
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        image: 'test-image.png',
      };
      jest.spyOn(productServicePort, 'getProducts').mockResolvedValue([product]);

      const result = await productHandler.getProducts();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        image: 'test-image.png',
      });
    });

    it('should handle products without image field', async () => {
      const product: Product = {
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
      };
      jest.spyOn(productServicePort, 'getProducts').mockResolvedValue([product]);

      const result = await productHandler.getProducts();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        image: undefined,
      });
    });
  });

  describe('seedProduct', () => {
    it('should call seedProducts from service port', async () => {
      jest.spyOn(productServicePort, 'seedProducts').mockResolvedValue();

      await productHandler.seedProduct();

      expect(productServicePort.seedProducts).toHaveBeenCalledTimes(1);
    });

    it('should return void when seeding is successful', async () => {
      jest.spyOn(productServicePort, 'seedProducts').mockResolvedValue();

      const result = await productHandler.seedProduct();

      expect(result).toBeUndefined();
    });
  });
});
