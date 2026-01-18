import { Acceptance } from "./acceptance.model";
import { Customer } from "./customer.model";
import { Delivery } from "./delivery.model";
import { Product } from "./product.model";
import { TransactionStatus } from "./transaction.status.model";

export interface OrderTransaction {
  id?: string;
  paymentGatewayTransactionId?: string;
  quantity: number;
  product: Product;
  delivery: Delivery;
  total?: number;
  status?: TransactionStatus;
  acceptanceEndUserPolicy?: Acceptance;
  acceptancePersonalDataAuthorization?: Acceptance;
  createdAt?: Date;
  customer: Customer;
  iva?: number;
}