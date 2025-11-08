import { Acceptance } from "domain/model/acceptance.model";
import { Card } from "domain/model/card.model";
import { OrderTransaction } from "domain/model/order.transaction.model";
import { CardTokenizationResponse } from "src/infrastructure/out/external/wompi/dto/response/card.tokenization.response";
import { CreateTransactionWompiResponse } from "src/infrastructure/out/external/wompi/dto/response/create.transaction.wompi.response";

export interface WompiServicePort {
    getAcceptances(): Promise<Acceptance[]>
    tokenizeCard(card: Card): Promise<CardTokenizationResponse>;
    pay(orderTransaction: OrderTransaction, card: Card): Promise<CreateTransactionWompiResponse>;
}