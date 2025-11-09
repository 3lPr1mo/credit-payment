import { Delivery } from "domain/model/delivery.model";
import { DeliveryServicePort } from "../delivery.service.port";
import { DeliveryPersistencePort } from "domain/spi/delivery.persistence.port";

export class DeliveryUseCase implements DeliveryServicePort {
  constructor(private readonly deliveryPersistencePort: DeliveryPersistencePort) {}

  async createDelivery(delivery: Delivery): Promise<Delivery> {
    return await this.deliveryPersistencePort.saveDelivery(delivery);
  }
}