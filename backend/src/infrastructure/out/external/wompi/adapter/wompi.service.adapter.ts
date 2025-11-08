import { Acceptance } from "domain/model/acceptance.model";
import { WompiServicePort } from "domain/spi/wompi.service.port";
import { WompiClient } from "../api/wompi.client";
import { AcceptanceType } from "domain/model/enum/acceptance.enum";
import { Injectable } from "@nestjs/common";
import { Card } from "domain/model/card.model";

@Injectable()
export class WompiServiceAdapter implements WompiServicePort {
    constructor(private readonly wompiClient: WompiClient) {}

    async getAcceptances(): Promise<Acceptance[]> {
        const response = await this.wompiClient.getAcceptancesContracts();
        
        const acceptanceEndUserPolicy: Acceptance = {
            acceptanceToken: response.find((acceptance) => acceptance.type === AcceptanceType.END_USER_POLICY)!.acceptanceToken,
            permalink: response.find((acceptance) => acceptance.type === AcceptanceType.END_USER_POLICY)!.permalink,
            type: AcceptanceType.END_USER_POLICY,
        };

        const acceptancePersonalDataAuthorization: Acceptance = {
            acceptanceToken: response.find((acceptance) => acceptance.type === AcceptanceType.PERSONAL_DATA_AUTH)!.acceptanceToken,
            permalink: response.find((acceptance) => acceptance.type === AcceptanceType.PERSONAL_DATA_AUTH)!.permalink,
            type: AcceptanceType.PERSONAL_DATA_AUTH,
        };

        return [acceptanceEndUserPolicy, acceptancePersonalDataAuthorization];
    }

}