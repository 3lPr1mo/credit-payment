import { Product } from '../model/product.model';

export interface ProductServicePort {
  getProducts(): Promise<Product[]>;
  seedProducts(): Promise<void>;
  findProductById(id: string): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<void>;
}
