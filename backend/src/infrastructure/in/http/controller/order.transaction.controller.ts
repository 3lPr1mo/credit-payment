import { Body, Controller, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBadRequestResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from "@nestjs/swagger";
import { CardRequest } from "application/dto/request/card.request";
import { StartOrderTransactionRequest } from "application/dto/request/start.order.transaction.request";
import { OrderTransactionResponse } from "application/dto/response/order.transaction.response";
import { OrderTransactionHandler } from "application/handler/order.transaction.handler";
import { OrderTransaction } from "domain/model/order.transaction.model";

@ApiTags('Order Transaction')
@Controller('order-transaction')
export class OrderTransactionController {
    constructor(private readonly handler: OrderTransactionHandler) {}

    @Post()
    @ApiOperation({ 
        summary: 'Start a new order transaction',
        description: 'Creates a new order transaction with customer, product, delivery and quantity information. Returns the transaction details with a unique identifier.' 
    })
    @ApiBody({
        type: StartOrderTransactionRequest,
        description: 'Order transaction details including customer information, product ID, delivery address, and quantity',
        examples: {
            'standard-order': {
                summary: 'Standard Order Example',
                description: 'A typical order transaction with all required fields',
                value: {
                    quantity: 2,
                    productId: "550e8400-e29b-41d4-a716-446655440001",
                    customer: {
                        name: "Juan Carlos",
                        lastName: "García López",
                        dni: "12345678",
                        phone: "+57 301 234 5678",
                        email: "juan.garcia@email.com"
                    },
                    delivery: {
                        address: "Calle 123 #45-67",
                        country: "Colombia",
                        city: "Bogotá",
                        region: "Cundinamarca",
                        postalCode: "110111",
                        destinataireName: "Paula Lopez"
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Order transaction created successfully',
        type: OrderTransactionResponse,
    })
    @ApiBadRequestResponse({
        description: 'Invalid request data - validation errors in customer, product, delivery or quantity fields'
    })
    @ApiNotFoundResponse({
        description: 'Product not found with the provided productId',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error occurred during order creation',
    })
    async createOrderTransaction(@Body() startOrderTransactionRequest: StartOrderTransactionRequest): Promise<OrderTransactionResponse> {
        return await this.handler.startTransaction(startOrderTransactionRequest);
    }

    @Post(':id/finish')
    @ApiOperation({ 
        summary: 'Finish an order transaction with payment',
        description: 'Completes an existing order transaction by processing payment with the provided card information. The transaction must be in a valid state to be finished.' 
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Unique identifier of the order transaction to finish',
        example: '550e8400-e29b-41d4-a716-446655440001',
        format: 'uuid'
    })
    @ApiBody({
        type: CardRequest,
        description: 'Credit card information for payment processing',
        examples: {
            'visa-card': {
                summary: 'Visa Card Example',
                description: 'Example of a valid Visa credit card for testing',
                value: {
                    number: "4111111111111111",
                    cvc: "123",
                    expMonth: "12",
                    expYear: "25",
                    cardHolder: "JUAN CARLOS GARCIA"
                }
            },
            'mastercard': {
                summary: 'Mastercard Example',
                description: 'Example of a valid Mastercard for testing',
                value: {
                    number: "5555555555554444",
                    cvc: "456",
                    expMonth: "06",
                    expYear: "26",
                    cardHolder: "MARIA FERNANDA LOPEZ"
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Order transaction finished successfully with payment processed',
        type: OrderTransactionResponse,
    })
    @ApiBadRequestResponse({
        description: 'Invalid request data - validation errors in card information or transaction cannot be finished',
    })
    @ApiNotFoundResponse({
        description: 'Order transaction not found with the provided ID',
    })
    @ApiInternalServerErrorResponse({
        description: 'Internal server error occurred during payment processing',
    })
    async finishOrderTransaction(@Param('id') id: string, @Body() card: CardRequest): Promise<OrderTransactionResponse> {
        return await this.handler.finishTransaction(id, card);
    }
}