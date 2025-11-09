import { Delivery } from "domain/model/delivery.model";

export interface DeliveryPersistencePort {
  saveDelivery(delivery: Delivery): Promise<Delivery>;
}