import { Card } from "domain/model/card.model";
import { OrderTransaction } from "domain/model/order.transaction.model";

export interface OrderTransactionServicePort {
    startTransaction(orderTransaction: OrderTransaction): Promise<OrderTransaction>;
    findAllPendingTransactions(): Promise<OrderTransaction[]>;
    finishTransactionWithCard(id: string, card: Card): Promise<OrderTransaction>
}