import { Acceptance } from "domain/model/acceptance.model";
import { WompiServicePort } from "domain/spi/wompi.service.port";
import { WompiClient } from "../api/wompi.client";
import { AcceptanceType } from "domain/model/enum/acceptance.enum";
import { Inject, Injectable } from "@nestjs/common";
import { Card } from "domain/model/card.model";
import { CardTokenizationResponse } from "../dto/response/card.tokenization.response";
import { OrderTransaction } from "domain/model/order.transaction.model";
import { CreateTransactionWompiResponse } from "../dto/response/create.transaction.wompi.response";
import * as crypto from 'crypto';
import { CreateTransactionWompiRequest } from "../dto/request/create.transaction.wompi.request";
import configuration from "src/infrastructure/out/postgres/config/configuration";
import { ConfigType } from "@nestjs/config";
import { Status } from "domain/model/enum/status.enum";
import { GetTransactionWompiResponse } from "../dto/response/get.transaction.wompi.response";

@Injectable()
export class WompiServiceAdapter implements WompiServicePort {
    constructor(
        @Inject(configuration.KEY)
        private readonly configService: ConfigType<typeof configuration>,
        private readonly wompiClient: WompiClient
    ) {}

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

    async tokenizeCard(card: Card): Promise<CardTokenizationResponse> {
        return await this.wompiClient.tokenizeCard(card);
    }

    async pay(order: OrderTransaction, card: Card): Promise<CreateTransactionWompiResponse> {
        const integrityKey = this.configService.wompi.integrityKey;

        const cardTokenization = await this.tokenizeCard(card);
        console.log("cardTokenization====", cardTokenization);
        console.log("total====", order.total);
        const amountInCents = Math.floor(order.total * 100); //mitiply by 100 to convert to cents
        console.log("amountInCents====", amountInCents);
        const unhasedSignature = `sk8-${order.id}${amountInCents}COP${integrityKey}`;
        const signature = crypto.createHash('sha256').update(unhasedSignature).digest('hex');

        const request: CreateTransactionWompiRequest = {
            acceptance_token: order.acceptanceEndUserPolicy.acceptanceToken,
            acceptance_personal_auth: order.acceptancePersonalDataAuthorization.acceptanceToken,
            amount_in_cents: amountInCents,
            currency: 'COP',
            signature: signature,
            customer_email: order.customer.email,
            reference: `sk8-${order.id}`,
            payment_method: {
                type: 'CARD',
                token: cardTokenization.data.id,
                installments: 1,
            },
            customer_data: {
                phone_number: order.customer.phone,
                full_name: `${order.customer.name} ${order.customer.lastName}`,
                legal_id: order.customer.dni,
                legal_id_type: 'CC',
            },
            shipping_address: {
                address_line_1: order.delivery.address,
                country: order.delivery.country,
                region: order.delivery.region,
                city: order.delivery.city,
                name: order.delivery.destinataireName,
                phone_number: order.customer.phone,
                postal_code: order.delivery.postalCode,
            }
        };

        console.log("request====", request);
        //create transaction
        const createTransactionResponse = await this.wompiClient.createTransaction(request);
        const status = createTransactionResponse.data.status as Status;
        if(status !== Status.PENDING){
            return createTransactionResponse;
        }

        //long-polling
        let paymentStatus = Status.PENDING;
        let transaction: CreateTransactionWompiResponse;
        while (paymentStatus === Status.PENDING) {
            transaction = await this.wompiClient.getTransaction(createTransactionResponse.data.id);
            paymentStatus = transaction.data.status as Status;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return transaction;

    }

}