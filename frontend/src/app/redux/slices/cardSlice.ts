import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CreditCard } from "../../../features/product/types/credit.card";

interface CardState {
    card: CreditCard | null;
}

const initialState: CardState = {
    card: null,
}

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {
        setCard: (state, action: PayloadAction<CreditCard>) => {
            state.card = action.payload;
        },
        clearCard: (state) => {
            state.card = null;
        }
    }
});

export const { setCard, clearCard } = cardSlice.actions;
export default cardSlice.reducer;