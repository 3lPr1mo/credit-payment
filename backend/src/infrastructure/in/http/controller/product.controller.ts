import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetProductReponse } from "application/dto/response/get.product.response";
import { ProductHandler } from "application/handler/product.handler";
import { ProductExceptionHandler } from "../exceptionhandler/product.exception.handler";

@ApiTags('products')
@Controller('products')
export class ProductController {

    constructor(
        private readonly handler: ProductHandler, 
        private readonly exceptionHandler: ProductExceptionHandler
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({
        status: 200,
        description: 'Return all products',
        type: [GetProductReponse]
    })
    @ApiResponse({
        status: 404,
        description: 'Products not found'
    })
    async getProducts(): Promise<GetProductReponse[]> {
        try {
            return await this.handler.getProducts();
        } catch (error) {
            this.exceptionHandler.handleGetProducts(error);
        }
    }

}