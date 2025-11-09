import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entity/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getProducts(): Promise<ProductEntity[]> {
    return this.productRepository.find();
  }

  async saveProducts(productEntities: ProductEntity[]): Promise<void> {
    await this.productRepository.save(productEntities);
  }

  async findProductById(id: string): Promise<ProductEntity> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async updateProductStock(id: string, quantity: number): Promise<void> {
    await this.productRepository.update(id, { stock: quantity });
  }
}
