import type { Customer } from "../../customer";
import type { Delivery } from "../../delivery";

export interface StartTransactionRequest {
    quantity: number;
    productId: string;
    customer: Customer;
    delivery: Delivery;
}