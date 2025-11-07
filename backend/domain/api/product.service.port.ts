import { Product } from '../model/product.model';

export interface ProductServicePort {
  getProducts(): Promise<Product[]>;
  seedProducts(): Promise<void>;
}
