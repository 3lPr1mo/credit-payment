import { TransactionStatus } from "domain/model/transaction.status.model";

export interface TransactionStatusPersistencePort {
  findTransactionStatusByName(name: string): Promise<TransactionStatus>;
}