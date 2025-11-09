import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { OrderTransaction } from "../../features/product/types/order.transaction";
import type { StartTransactionRequest } from "../../features/product/types/dto/request/start.transaction.request";
import type { CreditCard } from "../../features/product/types/credit.card";

export const orderTransactionApi = createApi({
    reducerPath: 'orderTransactionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    endpoints: (builder) => ({
        startOrderTransaction: builder.mutation<OrderTransaction, Partial<StartTransactionRequest>>({
            query: (body) => ({
                url: '/order-transaction',
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                }
            }),
        }),
        finishOrderTransaction: builder.mutation<OrderTransaction, {id: string, body: CreditCard}>({
            query: ({id, body}) => ({
                url: `/order-transaction/${id}/finish`,
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/json',
                }
            }),
        }),
    }),
});

export const { useStartOrderTransactionMutation, useFinishOrderTransactionMutation } = orderTransactionApi;