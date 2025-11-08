import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { OrderTransactionEntity } from "../entity/oder.transaction.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrderTransactionRepository{
    constructor(@InjectRepository(OrderTransactionEntity) private readonly orderTransactionRepository: Repository<OrderTransactionEntity>) {}

    async saveOrderTransaction(orderTransaction: OrderTransactionEntity): Promise<OrderTransactionEntity> {
        return await this.orderTransactionRepository.save(orderTransaction);
    }

    async findTransactionById(id: string): Promise<OrderTransactionEntity> {
        return await this.orderTransactionRepository.findOne({ where: { id }, relations: ['product', 'delivery', 'status', 'customer'] });
    }
}