import { Injectable } from "@nestjs/common";
import { TransactionStatusPersistencePort } from "domain/spi/transaction.status.persistence.port";
import { TransactionStatusRepository } from "../repository/transaction.status.repository";
import { TransactionStatus } from "domain/model/transaction.status.model";
import { Status } from "domain/model/enum/status.enum";

@Injectable()
export class TransactionStatusAdapter implements TransactionStatusPersistencePort {
    constructor(private readonly repository: TransactionStatusRepository) {}

    async findTransactionStatusByName(name: string): Promise<TransactionStatus> {
        const entity = await this.repository.findTransactionStatusByName(name);
        return {
            id: entity.id,
            name: entity.name as Status,
        };
    }
}