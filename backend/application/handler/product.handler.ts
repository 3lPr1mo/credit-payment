import { Injectable } from "@nestjs/common";
import { ProductServicePort } from "../../domain/api/product.service.port"
import { GetProductReponse } from "application/dto/response/get.product.response";

@Injectable()
export class ProductHandler {
    constructor(private readonly productServicePort: ProductServicePort){}

    async getProducts(): Promise<GetProductReponse[]> {
        const product = await this.productServicePort.getProducts();
        return product.map(
            (product): GetProductReponse => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                image: product.image
            })
        );
    }

    async seedProduct(): Promise<void> {
        return await this.productServicePort.seedProducts();
    }
}