import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../../features/product/types/product";
import type { OrderTransaction } from "../../../features/product/types/order.transaction";

interface ProductState {
    selectedProduct: Product | null;
};

const initialState: ProductState = {
    selectedProduct: null,
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setSelectedProduct: (state, action: PayloadAction<Product>) => {
            state.selectedProduct = action.payload;
        },
        setSelectedProductFromOrderTransaction: (state, action: PayloadAction<OrderTransaction>) => {
            state.selectedProduct = action.payload.product;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        }
    }
});

export const {setSelectedProduct, setSelectedProductFromOrderTransaction, clearSelectedProduct} = productSlice.actions;
export default productSlice.reducer;