import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductHandler } from 'application/handler/product.handler';
import { ProductExceptionHandler } from '../exceptionhandler/product.exception.handler';
import { GetProductReponse } from 'application/dto/response/get.product.response';
import { ProductNotFoundException } from 'domain/exception/product.not.found.exception';
import { NotFoundException } from '@nestjs/common';

describe('ProductController', () => {
  let productController: ProductController;
  let productHandler: ProductHandler;
  let productExceptionHandler: ProductExceptionHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductHandler,
          useValue: {
            getProducts: jest.fn(),
          },
        },
        {
          provide: ProductExceptionHandler,
          useValue: {
            handleGetProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productHandler = module.get<ProductHandler>(ProductHandler);
    productExceptionHandler = module.get<ProductExceptionHandler>(ProductExceptionHandler);
  });

  describe('getProducts', () => {
    it('should return products when handler succeeds', async () => {
      const mockProducts: GetProductReponse[] = [
        {
          id: '1',
          name: 'Product 1',
          description: 'Description 1',
          price: 100.5,
          stock: 10,
          image: 'image1.png',
        },
      ];

      jest.spyOn(productHandler, 'getProducts').mockResolvedValue(mockProducts);

      const result = await productController.getProducts();

      expect(result).toEqual(mockProducts);
      expect(productHandler.getProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle errors through exception handler', async () => {
      const error = new ProductNotFoundException('Products not found');
      jest.spyOn(productHandler, 'getProducts').mockRejectedValue(error);
      jest.spyOn(productExceptionHandler, 'handleGetProducts').mockImplementation(() => {
        throw new NotFoundException(error.message);
      });

      await expect(productController.getProducts()).rejects.toThrow(NotFoundException);
      expect(productExceptionHandler.handleGetProducts).toHaveBeenCalledWith(error);
    });
  });
});
