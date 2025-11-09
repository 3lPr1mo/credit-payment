import { Injectable } from "@nestjs/common";
import { OrderTransaction } from "domain/model/order.transaction.model";
import { OrderTransactionPersistencePort } from "domain/spi/order.transaction.persistence.port";
import { OrderTransactionRepository } from "../repository/order.transaction.repository";
import { OrderTransactionEntity } from "../entity/oder.transaction.entity";
import { Status } from "domain/model/enum/status.enum";

@Injectable()
export class OrderTransactionAdapter implements OrderTransactionPersistencePort {
    
    constructor(private readonly repository: OrderTransactionRepository) {}
    
    async saveOrderTransaction(orderTransaction: OrderTransaction): Promise<OrderTransaction> {
        const entity = this.toEntityFromModel(orderTransaction);
        const entitySaved = await this.repository.saveOrderTransaction(entity);
        return this.toModelFromEntity(entitySaved);
    }

    async findTransactionById(id: string): Promise<OrderTransaction> {
        const entity = await this.repository.findTransactionById(id);
        return this.toModelFromEntity(entity);
    }

    private toEntityFromModel(model: OrderTransaction): OrderTransactionEntity {
        return {
            id: model.id,
            paymentGatewayTransactionId: model.paymentGatewayTransactionId,
            quantity: model.quantity,
            product: {
                id: model.product.id,
                name: model.product.name,
                description: model.product.description,
                price: model.product.price,
                stock: model.product.stock,
                image: model.product.image,
            },
            delivery: {
                id: model.delivery.id,
                address: model.delivery.address,
                country: model.delivery.country,
                city: model.delivery.city,
                region: model.delivery.region,
                destinataireName: model.delivery.destinataireName,
                postalCode: model.delivery.postalCode,
                fee: model.delivery.fee,
            },
            total: model.total,
            status: {
                id: model.status.id,
                name: model.status.name
            },
            acceptanceEndUserPolicy: model.acceptanceEndUserPolicy.acceptanceToken,
            acceptancePersonalDataAuthorization: model.acceptancePersonalDataAuthorization.acceptanceToken,
            customer: {
                id: model.customer.id,
                name: model.customer.name,
                lastName: model.customer.lastName,
                dni: model.customer.dni,
                phone: model.customer.phone,
                email: model.customer.email,
            },
            createdAt: model.createdAt
        }
    }

    private toModelFromEntity(entity: Partial<OrderTransactionEntity>): OrderTransaction {
        return {
            id: entity.id,
            paymentGatewayTransactionId: entity.paymentGatewayTransactionId,
            quantity: entity.quantity,
            product: entity.product,
            delivery: entity.delivery,
            total: entity.total,
            status: {
                id: entity.status.id,
                name: entity.status.name as Status,
            },
            acceptanceEndUserPolicy: {
                acceptanceToken: entity.acceptanceEndUserPolicy,
            },
            acceptancePersonalDataAuthorization: {
                acceptanceToken: entity.acceptancePersonalDataAuthorization,
            },
            customer: {
                id: entity.customer.id,
                name: entity.customer.name,
                lastName: entity.customer.lastName,
                dni: entity.customer.dni,
                phone: entity.customer.phone,
                email: entity.customer.email,
            },
            createdAt: entity.createdAt,
        }
    }
    
}