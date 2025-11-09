import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryEntity } from "../entity/delivery.entity";
import { Repository } from "typeorm";

@Injectable()
export class DeliveryRepository {
    constructor(@InjectRepository(DeliveryEntity) private readonly deliveryRepository: Repository<DeliveryEntity>) {}

    async saveDelivery(deliveryEntity: DeliveryEntity): Promise<DeliveryEntity> {
        return await this.deliveryRepository.save(deliveryEntity);
    }
}