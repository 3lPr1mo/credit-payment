import { Inject, Injectable } from "@nestjs/common";
import { CardRequest } from "application/dto/request/card.request";
import { StartOrderTransactionRequest } from "application/dto/request/start.order.transaction.request";
import { OrderTransactionResponse } from "application/dto/response/order.transaction.response";
import { OrderTransactionServicePort } from "domain/api/order.transaction.service.port";
import { Card } from "domain/model/card.model";
import { OrderTransaction } from "domain/model/order.transaction.model";

@Injectable()
export class OrderTransactionHandler {
    constructor(
        @Inject('OrderTransactionUseCase')private readonly orderTransactionServicePort: OrderTransactionServicePort
    ) {}

    async startTransaction(request: StartOrderTransactionRequest): Promise<OrderTransactionResponse>{
        const orderTransaction: OrderTransaction = {
            quantity: request.quantity,
            product: {
                id: request.productId,
            },
            delivery: {
                address: request.delivery.address,
                country: request.delivery.country,
                city: request.delivery.city,
                region: request.delivery.region,
                postalCode: request.delivery.postalCode,
                destinataireName: request.delivery.destinataireName,
            },
            customer: {
                name: request.customer.name,
                lastName: request.customer.lastName,
                dni: request.customer.dni,
                phone: request.customer.phone,
                email: request.customer.email,
            }
        }
        const response = await this.orderTransactionServicePort.startTransaction(orderTransaction);
        return this.toDtoResponseFromModel(response);
    }

    async finishTransaction(id: string, card: CardRequest): Promise<OrderTransactionResponse>{
        const modelCard: Card = {...card};
        const response = await this.orderTransactionServicePort.finishTransactionWithCard(id, modelCard);
        return this.toDtoResponseFromModel(response);
    }

    private toDtoResponseFromModel(model: OrderTransaction): OrderTransactionResponse {
        return {
            id: model.id,
            paymentGatewayTransactionId: model.paymentGatewayTransactionId,
            quantity: model.quantity,
            product: {
                id: model.product.id,
                name: model.product.name,
                description: model.product.description,
                price: model.product.price,
                image: model.product.image,
            },
            delivery: model.delivery,
            customer: model.customer,
            total: model.total,
            status: model.status.name,
            createdAt: model.createdAt
        }
    }
}