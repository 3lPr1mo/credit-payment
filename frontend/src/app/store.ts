import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./redux/productsApi";
import productReducer from "./redux/slices/productSlice";

export const store = configureStore({
    reducer: {
        [productApi.reducerPath]: productApi.reducer,
        product: productReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;