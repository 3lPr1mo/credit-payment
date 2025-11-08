import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { AxiosError } from "axios";
import { Acceptance } from "domain/model/acceptance.model";
import { Card } from "domain/model/card.model";
import { catchError, firstValueFrom } from "rxjs";
import configuration from "src/infrastructure/out/postgres/config/configuration";
import { CreateTransactionWompiRequest } from "../dto/request/create.transaction.wompi.request";
import { CardTokenizationResponse } from "../dto/response/card.tokenization.response";
import { GetTransactionWompiResponse } from "../dto/response/get.transaction.wompi.response";

@Injectable()
export class WompiClient {
    constructor(
        @Inject(configuration.KEY)
        private readonly configService: ConfigType<typeof configuration>,
        private readonly httpClient: HttpService
    ) {}

    async getAcceptancesContracts(): Promise<Acceptance[]> {
        const url = this.configService.wompi.apiUrl;
        const publicKey = this.configService.wompi.publicKey;

        const { data } = await firstValueFrom(
            this.httpClient.get(`${url}/merchants/${publicKey}`).pipe(
                catchError((error: AxiosError) => {
                    throw new Error(error.message);
                })
            )
        );

        const presignedEntries = Object.entries(data)
        .filter(([key]) => key.startsWith('presigned_'))
        .map(([_, value]) => value as Acceptance);

        return presignedEntries;
    }

    async tokenizeCard(card: Card): Promise<CardTokenizationResponse> {
        const url = this.configService.wompi.apiUrl;
        const publicKey = this.configService.wompi.publicKey;

        const {data} = await firstValueFrom(
            this.httpClient.post(
                `${url}/tokens/cards`, 
                {
                    number: card.number,
                    cvc: card.cvc,
                    exp_month: card.expMont,
                    exp_year: card.expYear,
                    card_holder: card.cardHolder,
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${publicKey}`,
                    }
                }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new Error(error.message);
                })
            )
        );

        return data;
    }

    async createTransaction(request: CreateTransactionWompiRequest): Promise<CreateTransactionWompiRequest> {
        const url = this.configService.wompi.apiUrl;
        const publicKey = this.configService.wompi.publicKey;

        const {data} = await firstValueFrom(
            this.httpClient.post(`${url}/tokens/cards`, request, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicKey}`,
                }
            }).pipe(
                catchError((error: AxiosError) => {
                    throw new Error(error.message);
                })
            )
        );
        return data;
    }

    async getTransaction(transactionId: string): Promise<GetTransactionWompiResponse> {
        const url = this.configService.wompi.apiUrl;

        const {data} = await firstValueFrom(
            this.httpClient.get(`${url}/transactions/${transactionId}`).pipe(
                catchError((error: AxiosError) => {
                    throw new Error(error.message);
                })
            )
        );
        
        return data;
    }
}