import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Delivery } from "../../../features/product/types/delivery";
import type { OrderTransaction } from "../../../features/product/types/order.transaction";

interface DeliveryState {
    delivery: Delivery | null;
}

const initialState: DeliveryState = {
    delivery: null,
}

export const deliverySlice = createSlice({
    name: 'delivery',
    initialState,
    reducers: {
        setDelivery: (state, action: PayloadAction<Delivery>) => {
            state.delivery = action.payload;
        },
        setDeliveryFromOrderTransaction: (state, action: PayloadAction<OrderTransaction>) => {
            state.delivery = action.payload.delivery;
        },
        clearDelivery: (state) => {
            state.delivery = null;
        }
    }
});

export const { setDelivery, clearDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;