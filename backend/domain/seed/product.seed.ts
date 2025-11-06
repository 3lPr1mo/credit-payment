import { faker } from "@faker-js/faker";
import { Product } from "../model/product.model";

export function seedProducts(count: number): Product[] {
    const products: Product[] = [];
    for(let i = 0; i < count; i++){
        products.push({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({min: 1, max: 100}),
            image: faker.image.urlPicsumPhotos({width: 200, height: 200})
        });
    }
    return products;
}

export const productSeed: Product[] = seedProducts(50);