import { Injectable } from "@nestjs/common";
import { Product } from "domain/model/product.model";
import { ProductPersistencePort } from "domain/spi/product.persistence.port";
import { ProductRepository } from "../repository/product.repository";
import { ProductEntity } from "../entity/product.entity";

@Injectable()
export class ProductAdapter implements ProductPersistencePort {

    constructor(private readonly repository: ProductRepository){}

    async getProducts(): Promise<Product[] | null> {
        const productEntities = await this.repository.getProducts();

        if(productEntities.length === 0){
            return null;
        }

        return productEntities.map((entity): Product => {
            return {
                id: entity.id,
                name: entity.name,
                description: entity.description,
                price: entity.price,
                stock: entity.stock,
                image: entity.image
            };
        });

    }

    async seedProducts(products: Product[]): Promise<void> {
        const productEntities = products.map((product): ProductEntity => {
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                image: product.image
            };
        });

        return await this.repository.saveProducts(productEntities);
    }
    
}