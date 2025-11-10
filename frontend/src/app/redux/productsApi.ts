import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product } from "../../features/product/types/product";

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    endpoints: (builder) => ({
        getProducts: builder.query<Product[], void>({
            query: () => '/products',
        })
    })
});

export const { useGetProductsQuery } = productApi;