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
import { CreateTransactionWompiResponse } from "../dto/response/create.transaction.wompi.response";

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

        const acceptances: Acceptance[] = [];
        
        if (data.data.presigned_acceptance) {
            acceptances.push({
                acceptanceToken: data.data.presigned_acceptance.acceptance_token,
                permalink: data.data.presigned_acceptance.permalink,
                type: data.data.presigned_acceptance.type,
            });
        }
        
        if (data.data.presigned_personal_data_auth) {
            acceptances.push({
                acceptanceToken: data.data.presigned_personal_data_auth.acceptance_token,
                permalink: data.data.presigned_personal_data_auth.permalink,
                type: data.data.presigned_personal_data_auth.type,
            });
        }

        return acceptances;
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
                    exp_month: card.expMonth,
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

    async createTransaction(request: CreateTransactionWompiRequest): Promise<CreateTransactionWompiResponse> {
        const url = this.configService.wompi.apiUrl;
        const publicKey = this.configService.wompi.publicKey;

        const {data} = await firstValueFrom(
            this.httpClient.post(`${url}/transactions`, request, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${publicKey}`,
                },
            }).pipe(
                catchError((error: AxiosError) => {
                    if(error.response){
                        const explicitError = error.response.data;
                        console.log("error.response====", JSON.stringify(explicitError, null, 2));
                    }
                    throw new Error(error.message);
                })
            )
        );

        return data;
    }

    async getTransaction(transactionId: string): Promise<CreateTransactionWompiResponse> {
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