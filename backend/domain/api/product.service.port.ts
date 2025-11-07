import { Product } from '../model/product.model';

export abstract class ProductServicePort {
  abstract getProducts(): Promise<Product[]>;
  abstract seedProducts(): Promise<void>;
}
