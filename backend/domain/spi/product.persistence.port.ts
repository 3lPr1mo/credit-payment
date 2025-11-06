import { Product } from "../model/product.model";

export abstract class ProductPersistencePort {
    abstract getProducts(): Promise<Product[] | null>;
    abstract seedProducts(products: Product[]): Promise<void>;
}