import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { productApi } from "./redux/productsApi";
import productReducer from "./redux/slices/productSlice";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const reducer = combineReducers({
    [productApi.reducerPath]: productApi.reducer,
    product: productReducer
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['product'],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(productApi.middleware),
});

export const persistor = persistStore(store);


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;