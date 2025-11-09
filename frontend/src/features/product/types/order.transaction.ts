import type { Customer } from "./customer"
import type { Delivery } from "./delivery"
import type { Product } from "./product"

export type OrderTransaction = {
    id: string,
    paymentGatewayTransactionId: string
    quantity: number,
    product: Product,
    delivery: Delivery,
    total: number,
    status: string,
    createdAt: string,
    customer: Customer,
}