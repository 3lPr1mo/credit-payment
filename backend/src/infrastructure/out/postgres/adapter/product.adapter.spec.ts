import { Test, TestingModule } from '@nestjs/testing';
import { ProductAdapter } from './product.adapter';
import { ProductRepository } from '../repository/product.repository';
import { ProductEntity } from '../entity/product.entity';
import { Product } from 'domain/model/product.model';

describe('ProductAdapter', () => {
  let productAdapter: ProductAdapter;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAdapter,
        {
          provide: ProductRepository,
          useValue: {
            getProducts: jest.fn(),
            saveProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    productAdapter = module.get<ProductAdapter>(ProductAdapter);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  describe('getProducts', () => {
    it('should return mapped products when products exist', async () => {
      const productEntities: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description 2',
          price: 200.75,
          stock: 20,
          image: 'image2.png',
        },
      ];

      jest.spyOn(productRepository, 'getProducts').mockResolvedValue(productEntities);

      const result = await productAdapter.getProducts();

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result![0]).toEqual({
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100.5,
        stock: 10,
        image: 'image1.png',
      });
      expect(result![1]).toEqual({
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 200.75,
        stock: 20,
        image: 'image2.png',
      });
      expect(productRepository.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should return null when no products exist', async () => {
      jest.spyOn(productRepository, 'getProducts').mockResolvedValue([]);

      const result = await productAdapter.getProducts();

      expect(result).toBeNull();
      expect(productRepository.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should map products without image correctly', async () => {
      const productEntities: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
        },
      ];

      jest.spyOn(productRepository, 'getProducts').mockResolvedValue(productEntities);

      const result = await productAdapter.getProducts();

      expect(result).not.toBeNull();
      expect(result![0].image).toBeUndefined();
      expect(result![0]).toEqual({
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100.5,
        stock: 10,
        image: undefined,
      });
    });

    it('should map all product fields correctly', async () => {
      const productEntity: ProductEntity = {
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 5,
        image: 'test-image.png',
      };

      jest.spyOn(productRepository, 'getProducts').mockResolvedValue([productEntity]);

      const result = await productAdapter.getProducts();

      expect(result).not.toBeNull();
      expect(result![0]).toEqual({
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 5,
        image: 'test-image.png',
      });
    });
  });

  describe('seedProducts', () => {
    it('should convert products to entities and save them', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description 2',
          price: 200.75,
          stock: 20,
          image: 'image2.png',
        },
      ];

      jest.spyOn(productRepository, 'saveProducts').mockResolvedValue();

      await productAdapter.seedProducts(products);

      expect(productRepository.saveProducts).toHaveBeenCalledTimes(1);
      expect(productRepository.saveProducts).toHaveBeenCalledWith([
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
        {
          id: '2',
          name: 'Product 2',
          description: 'Description 2',
          price: 200.75,
          stock: 20,
          image: 'image2.png',
        },
      ]);
    });

    it('should handle products without image when seeding', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
        },
      ];

      jest.spyOn(productRepository, 'saveProducts').mockResolvedValue();

      await productAdapter.seedProducts(products);

      expect(productRepository.saveProducts).toHaveBeenCalledWith([
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: undefined,
        },
      ]);
    });

    it('should handle empty array when seeding', async () => {
      const products: Product[] = [];

      jest.spyOn(productRepository, 'saveProducts').mockResolvedValue();

      await productAdapter.seedProducts(products);

      expect(productRepository.saveProducts).toHaveBeenCalledTimes(1);
      expect(productRepository.saveProducts).toHaveBeenCalledWith([]);
    });

    it('should return void when seeding is successful', async () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
      ];

      jest.spyOn(productRepository, 'saveProducts').mockResolvedValue();

      const result = await productAdapter.seedProducts(products);

      expect(result).toBeUndefined();
    });
  });
});
