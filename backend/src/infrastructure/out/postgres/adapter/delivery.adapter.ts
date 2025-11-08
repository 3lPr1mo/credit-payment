import { Injectable } from "@nestjs/common";
import { DeliveryPersistencePort } from "domain/spi/delivery.persistence.port";
import { DeliveryRepository } from "../repository/delivery.repository";
import { Delivery } from "domain/model/delivery.model";

@Injectable()
export class DeliveryAdapter implements DeliveryPersistencePort {

    constructor(private readonly repository: DeliveryRepository) {}

    async saveDelivery(delivery: Delivery): Promise<Delivery> {
        return await this.repository.saveDelivery(delivery);
    }

}