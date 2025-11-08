import { Injectable } from '@nestjs/common';
import { ProductServicePort } from '../product.service.port';
import { Product } from '../../model/product.model';
import { ProductPersistencePort } from '../../spi/product.persistence.port';
import { productSeed } from '../../seed/product.seed';
import { ProductNotFoundException } from '../../exception/product.not.found.exception';
import { ExceptionConstant } from '../../constant/exception.constants';

export class ProductUseCase implements ProductServicePort {
  constructor(private readonly productPersistencePort: ProductPersistencePort) {}

  async getProducts(): Promise<Product[]> {
    const products = await this.productPersistencePort.getProducts();
    if (!products) {
      throw new ProductNotFoundException(ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE);
    }
    return products;
  }

  async seedProducts(): Promise<void> {
    const products = await this.productPersistencePort.getProducts();

    if (!products) {
      return await this.productPersistencePort.seedProducts(productSeed);
    }

    return Promise.resolve();
  }

  async findProductById(id: string): Promise<Product> {
    return await this.productPersistencePort.findProductById(id);
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    const product = await this.productPersistencePort.findProductById(id);
    if(!product){
      throw new ProductNotFoundException(ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE);
    }
    product.stock = product.stock - quantity;
    return await this.productPersistencePort.updateProductStock(id, product.stock);
  }


}
