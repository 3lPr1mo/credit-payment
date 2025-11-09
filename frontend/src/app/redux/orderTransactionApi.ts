import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { OrderTransaction } from "../../features/product/types/order.transaction";

export const orderTransactionApi = createApi({
    reducerPath: 'orderTransactionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    endpoints: (builder) => ({
        getOrderTransaction: builder.query<OrderTransaction, void>({
            query: () => '/order-transactions',
        }),
    }),
});

export const { useGetOrderTransactionQuery } = orderTransactionApi;