import { Delivery } from "domain/model/delivery.model";

export interface DeliveryServicePort {
  createDelivery(delivery: Delivery): Promise<Delivery>;
}