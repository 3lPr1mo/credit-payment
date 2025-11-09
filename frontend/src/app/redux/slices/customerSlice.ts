import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Customer } from "../../../features/product/types/customer";
import type { OrderTransaction } from "../../../features/product/types/order.transaction";

interface CustomerState {
    selectedCustomer: Customer | null;
};

const initialState: CustomerState = {
    selectedCustomer: null,
}

export const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        setSelectedCustomer: (state, action: PayloadAction<Customer>) => {
            state.selectedCustomer = action.payload;
        },
        setSelectedCustomerFromOrderTransaction: (state, action: PayloadAction<OrderTransaction>) => {
            state.selectedCustomer = action.payload.customer;
        },
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        }
    }
});

export const { setSelectedCustomer, setSelectedCustomerFromOrderTransaction, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;