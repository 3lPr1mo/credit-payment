import { Logger, NotFoundException } from '@nestjs/common';
import { ProductNotFoundException } from 'domain/exception/product.not.found.exception';

export class ProductExceptionHandler {
  handleGetProducts(error: Error): never {
    if (error instanceof ProductNotFoundException) {
      throw new NotFoundException(error.message);
    }
    Logger.error('Unexpected error', error.stack, ProductExceptionHandler.name);
    throw error;
  }
}
