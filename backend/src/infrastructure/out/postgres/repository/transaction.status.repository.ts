import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionStatusEntity } from "../entity/transaction.status.entity";
import { Repository } from "typeorm";

@Injectable()
export class TransactionStatusRepository {
    constructor(
        @InjectRepository(TransactionStatusEntity)
        private readonly transactionStatusRepository: Repository<TransactionStatusEntity>,
    ) {}

    async findTransactionStatusByName(name: string): Promise<TransactionStatusEntity> {
        return await this.transactionStatusRepository.findOne({ where: { name } });
    }
}