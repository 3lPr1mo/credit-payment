import { Product } from '../model/product.model';

export interface ProductPersistencePort {
  getProducts(): Promise<Product[] | null>;
  seedProducts(products: Product[]): Promise<void>;
  findProductById(id: string): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<void>;
}
