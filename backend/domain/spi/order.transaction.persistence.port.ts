import { OrderTransaction } from "domain/model/order.transaction.model";

export interface OrderTransactionPersistencePort {
  saveOrderTransaction(orderTransaction: OrderTransaction): Promise<OrderTransaction>;
  findTransactionById(id: string): Promise<OrderTransaction>;
}