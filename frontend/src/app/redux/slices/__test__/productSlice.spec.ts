import { describe, it, expect } from 'vitest';
import productReducer, { 
    setSelectedProduct, 
    setSelectedProductFromOrderTransaction, 
    clearSelectedProduct 
} from '../productSlice';
import type { Product } from '../../../../features/product/types/product';
import type { OrderTransaction } from '../../../../features/product/types/order.transaction';

describe('productSlice', () => {
    const mockProduct: Product = {
        id: '1',
        name: 'Test Product',
        description: 'A test product description',
        stock: 10,
        price: 99.99,
        image: 'test-image.jpg'
    };

    const mockOrderTransaction: OrderTransaction = {
        id: 'order-1',
        paymentGatewayTransactionId: 'payment-123',
        quantity: 2,
        product: mockProduct,
        delivery: {
            address: 'Test Address',
            city: 'Test City',
            region: 'Test Region',
            postalCode: '12345',
            country: 'Test Country',
            destinataireName: 'John Doe'
        },
        total: 199.98,
        status: 'pending',
        createdAt: '2023-01-01T00:00:00Z',
        customer: {
            name: 'John',
            lastName: 'Doe',
            dni: '12345678',
            phone: '+1234567890',
            email: 'john@example.com'
        }
    };

    const initialState = {
        selectedProduct: null
    };

    describe('initial state', () => {
        it('should return the initial state', () => {
            const result = productReducer(undefined, { type: 'unknown' });
            expect(result).toEqual(initialState);
        });

        it('should have selectedProduct as null initially', () => {
            const result = productReducer(undefined, { type: 'unknown' });
            expect(result.selectedProduct).toBeNull();
        });
    });

    describe('setSelectedProduct', () => {
        it('should set the selected product', () => {
            const result = productReducer(initialState, setSelectedProduct(mockProduct));
            
            expect(result.selectedProduct).toEqual(mockProduct);
            expect(result.selectedProduct?.id).toBe('1');
            expect(result.selectedProduct?.name).toBe('Test Product');
            expect(result.selectedProduct?.price).toBe(99.99);
        });

        it('should replace the previously selected product', () => {
            const stateWithProduct = {
                selectedProduct: mockProduct
            };

            const newProduct: Product = {
                id: '2',
                name: 'New Product',
                description: 'A new product',
                stock: 5,
                price: 149.99,
                image: 'new-image.jpg'
            };

            const result = productReducer(stateWithProduct, setSelectedProduct(newProduct));
            
            expect(result.selectedProduct).toEqual(newProduct);
            expect(result.selectedProduct?.id).toBe('2');
            expect(result.selectedProduct?.name).toBe('New Product');
        });

        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            productReducer(initialState, setSelectedProduct(mockProduct));
            
            expect(initialState).toEqual(originalState);
        });
    });

    describe('setSelectedProductFromOrderTransaction', () => {
        it('should set the selected product from order transaction', () => {
            const result = productReducer(
                initialState, 
                setSelectedProductFromOrderTransaction(mockOrderTransaction)
            );
            
            expect(result.selectedProduct).toEqual(mockProduct);
            expect(result.selectedProduct?.id).toBe('1');
            expect(result.selectedProduct?.name).toBe('Test Product');
        });

        it('should extract product correctly from order transaction', () => {
            const result = productReducer(
                initialState, 
                setSelectedProductFromOrderTransaction(mockOrderTransaction)
            );
            
            expect(result.selectedProduct).toBe(mockOrderTransaction.product);
            expect(result.selectedProduct?.price).toBe(99.99);
            expect(result.selectedProduct?.stock).toBe(10);
        });

        it('should replace previously selected product with product from transaction', () => {
            const stateWithProduct = {
                selectedProduct: {
                    id: '999',
                    name: 'Old Product',
                    description: 'Old description',
                    stock: 1,
                    price: 50.00,
                    image: 'old.jpg'
                }
            };

            const result = productReducer(
                stateWithProduct, 
                setSelectedProductFromOrderTransaction(mockOrderTransaction)
            );
            
            expect(result.selectedProduct).toEqual(mockProduct);
            expect(result.selectedProduct?.id).toBe('1');
            expect(result.selectedProduct?.name).toBe('Test Product');
        });

        it('should not mutate the original state', () => {
            const originalState = { ...initialState };
            productReducer(initialState, setSelectedProductFromOrderTransaction(mockOrderTransaction));
            
            expect(initialState).toEqual(originalState);
        });
    });

    describe('clearSelectedProduct', () => {
        it('should clear the selected product', () => {
            const stateWithProduct = {
                selectedProduct: mockProduct
            };

            const result = productReducer(stateWithProduct, clearSelectedProduct());
            
            expect(result.selectedProduct).toBeNull();
        });

        it('should work when selectedProduct is already null', () => {
            const result = productReducer(initialState, clearSelectedProduct());
            
            expect(result.selectedProduct).toBeNull();
        });

        it('should not mutate the original state', () => {
            const stateWithProduct = {
                selectedProduct: mockProduct
            };
            const originalState = { ...stateWithProduct };
            
            productReducer(stateWithProduct, clearSelectedProduct());
            
            expect(stateWithProduct).toEqual(originalState);
        });
    });

    describe('reducer integration', () => {
        it('should handle multiple actions in sequence', () => {
            let state = productReducer(undefined, { type: 'unknown' });
            expect(state.selectedProduct).toBeNull();

            // Set a product
            state = productReducer(state, setSelectedProduct(mockProduct));
            expect(state.selectedProduct).toEqual(mockProduct);

            // Clear the product
            state = productReducer(state, clearSelectedProduct());
            expect(state.selectedProduct).toBeNull();

            // Set product from order transaction
            state = productReducer(state, setSelectedProductFromOrderTransaction(mockOrderTransaction));
            expect(state.selectedProduct).toEqual(mockProduct);
        });

        it('should maintain state immutability throughout operations', () => {
            const states: any[] = [];
            
            let currentState = productReducer(undefined, { type: 'unknown' });
            states.push({ ...currentState });

            currentState = productReducer(currentState, setSelectedProduct(mockProduct));
            states.push({ ...currentState });

            currentState = productReducer(currentState, clearSelectedProduct());
            states.push({ ...currentState });

            // Verify each state is different and hasn't been mutated
            expect(states[0].selectedProduct).toBeNull();
            expect(states[1].selectedProduct).toEqual(mockProduct);
            expect(states[2].selectedProduct).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle undefined product in setSelectedProduct', () => {
            const result = productReducer(initialState, setSelectedProduct(undefined as any));
            expect(result.selectedProduct).toBeUndefined();
        });

        it('should handle order transaction with undefined product', () => {
            const transactionWithUndefinedProduct = {
                ...mockOrderTransaction,
                product: undefined as any
            };

            const result = productReducer(
                initialState, 
                setSelectedProductFromOrderTransaction(transactionWithUndefinedProduct)
            );
            
            expect(result.selectedProduct).toBeUndefined();
        });

        it('should handle empty product object', () => {
            const emptyProduct = {} as Product;
            const result = productReducer(initialState, setSelectedProduct(emptyProduct));
            
            expect(result.selectedProduct).toEqual(emptyProduct);
        });
    });
});
