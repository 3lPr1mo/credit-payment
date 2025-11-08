import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from './product.repository';
import { ProductEntity } from '../entity/product.entity';

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let repository: Repository<ProductEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    productRepository = module.get<ProductRepository>(ProductRepository);
    repository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
  });

  describe('getProducts', () => {
    it('should return products when products exist', async () => {
      const mockProducts: ProductEntity[] = [
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

      jest.spyOn(repository, 'find').mockResolvedValue(mockProducts);

      const result = await productRepository.getProducts();

      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith();
    });

    it('should return empty array when no products exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await productRepository.getProducts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return products without image when image is null', async () => {
      const mockProducts: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockProducts);

      const result = await productRepository.getProducts();

      expect(result).toEqual(mockProducts);
      expect(result[0].image).toBeUndefined();
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle decimal prices correctly', async () => {
      const mockProducts: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          stock: 5,
          image: 'image.png',
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockProducts);

      const result = await productRepository.getProducts();

      expect(result[0].price).toBe(99.99);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveProducts', () => {
    it('should call save method with product entities', async () => {
      const productEntities: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
      ];

      jest.spyOn(repository, 'save').mockResolvedValue(productEntities as any);

      await productRepository.saveProducts(productEntities);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(productEntities);
    });

    it('should save multiple products', async () => {
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

      jest.spyOn(repository, 'save').mockResolvedValue(productEntities as any);

      await productRepository.saveProducts(productEntities);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(productEntities);
    });

    it('should return void when saving is successful', async () => {
      const productEntities: ProductEntity[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
      ];

      jest.spyOn(repository, 'save').mockResolvedValue(productEntities as any);

      const result = await productRepository.saveProducts(productEntities);

      expect(result).toBeUndefined();
    });
  });
});
