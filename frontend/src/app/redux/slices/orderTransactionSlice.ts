import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { OrderTransaction } from "../../../features/product/types/order.transaction";

interface OrderTransactionState {
    orderTransaction: OrderTransaction | null;
}

const initialState: OrderTransactionState = {
    orderTransaction: null,
}

export const orderTransactionSlice = createSlice({
    name: 'orderTransaction',
    initialState,
    reducers: {
        setOrderTransaction: (state, action: PayloadAction<OrderTransaction>) => {
            state.orderTransaction = action.payload;
        },
        clearOrderTransaction: (state) => {
            state.orderTransaction = null;
        }
    }
});

export const { setOrderTransaction, clearOrderTransaction } = orderTransactionSlice.actions;
export default orderTransactionSlice.reducer;