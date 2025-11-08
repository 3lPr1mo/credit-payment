import { Customer } from "./customer.model";
import { Delivery } from "./delivery.model";
import { AcceptanceType } from "./enum/acceptance.enum";
import { Product } from "./product.model";
import { Status } from "./status.model";

export interface OrderTransaction {
  id?: string;
  paymentGatewayTransactionId?: string;
  quantity: number;
  product: Product;
  delivery: Delivery;
  total: number;
  status?: Status;
  acceptanceEndUserPolicy?: AcceptanceType;
  acceptancePersonalDataAuthorization?: AcceptanceType;
  createdAt?: Date;
  customer: Customer;
}