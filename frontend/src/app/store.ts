import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { productApi } from "./redux/productsApi";
import productReducer from "./redux/slices/productSlice";
import customerReducer from "./redux/slices/customerSlice";
import deliveryReducer from "./redux/slices/deliverySlice";
import orderTransactionReducer from "./redux/slices/orderTransactionSlice";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { orderTransactionApi } from "./redux/orderTransactionApi";

const reducer = combineReducers({
    [productApi.reducerPath]: productApi.reducer,
    product: productReducer,
    customer: customerReducer,
    delivery: deliveryReducer,
    orderTransaction: orderTransactionReducer,
    [orderTransactionApi.reducerPath]: orderTransactionApi.reducer,
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['product', 'customer', 'delivery', 'orderTransaction'],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(productApi.middleware).concat(orderTransactionApi.middleware),
});

export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;