import { describe, it, expect } from 'vitest';
import customerReducer, { 
    setSelectedCustomer, 
    setSelectedCustomerFromOrderTransaction, 
    clearSelectedCustomer 
} from '../customerSlice';
import type { Customer } from '../../../../features/product/types/customer';
import type { OrderTransaction } from '../../../../features/product/types/order.transaction';

describe('customerSlice', () => {
    const mockCustomer: Customer = {
        name: 'Juan',
        lastName: 'Pérez',
        dni: '12345678',
        phone: '+573123456789',
        email: 'juan.perez@email.com'
    };

    const mockOrderTransaction: OrderTransaction = {
        id: 'order-123',
        paymentGatewayTransactionId: 'txn-456',
        quantity: 2,
        product: {
            id: 'prod-1',
            name: 'Test Product',
            description: 'Test product description',
            stock: 10,
            price: 100,
            image: 'test.jpg'
        },
        delivery: {
            address: 'Test Address 123',
            country: 'Colombia',
            city: 'Test City',
            region: 'Test Region',
            postalCode: '12345',
            destinataireName: 'Juan Pérez'
        },
        total: 200,
        status: 'pending',
        createdAt: '2023-01-01',
        customer: mockCustomer
    };

    describe('initial state', () => {
        it('should have null selectedCustomer as initial state', () => {
            const initialState = customerReducer(undefined, { type: 'unknown' });
            
            expect(initialState).toEqual({
                selectedCustomer: null
            });
        });
    });

    describe('setSelectedCustomer', () => {
        it('should set the selected customer', () => {
            const initialState = {
                selectedCustomer: null
            };

            const newState = customerReducer(
                initialState,
                setSelectedCustomer(mockCustomer)
            );

            expect(newState.selectedCustomer).toEqual(mockCustomer);
        });

        it('should replace existing selected customer', () => {
            const existingCustomer: Customer = {
                name: 'María',
                lastName: 'García',
                dni: '87654321',
                phone: '+573987654321',
                email: 'maria.garcia@email.com'
            };

            const initialState = {
                selectedCustomer: existingCustomer
            };

            const newState = customerReducer(
                initialState,
                setSelectedCustomer(mockCustomer)
            );

            expect(newState.selectedCustomer).toEqual(mockCustomer);
            expect(newState.selectedCustomer).not.toEqual(existingCustomer);
        });
    });

    describe('setSelectedCustomerFromOrderTransaction', () => {
        it('should extract and set customer from order transaction', () => {
            const initialState = {
                selectedCustomer: null
            };

            const newState = customerReducer(
                initialState,
                setSelectedCustomerFromOrderTransaction(mockOrderTransaction)
            );

            expect(newState.selectedCustomer).toEqual(mockCustomer);
        });

        it('should replace existing customer when setting from order transaction', () => {
            const existingCustomer: Customer = {
                name: 'Carlos',
                lastName: 'López',
                dni: '11111111',
                phone: '+573111111111',
                email: 'carlos.lopez@email.com'
            };

            const initialState = {
                selectedCustomer: existingCustomer
            };

            const newState = customerReducer(
                initialState,
                setSelectedCustomerFromOrderTransaction(mockOrderTransaction)
            );

            expect(newState.selectedCustomer).toEqual(mockCustomer);
            expect(newState.selectedCustomer).not.toEqual(existingCustomer);
        });
    });

    describe('clearSelectedCustomer', () => {
        it('should clear the selected customer', () => {
            const initialState = {
                selectedCustomer: mockCustomer
            };

            const newState = customerReducer(
                initialState,
                clearSelectedCustomer()
            );

            expect(newState.selectedCustomer).toBeNull();
        });

        it('should not change state if customer is already null', () => {
            const initialState = {
                selectedCustomer: null
            };

            const newState = customerReducer(
                initialState,
                clearSelectedCustomer()
            );

            expect(newState.selectedCustomer).toBeNull();
        });
    });

    describe('action creators', () => {
        it('should create setSelectedCustomer action', () => {
            const expectedAction = {
                type: 'customer/setSelectedCustomer',
                payload: mockCustomer
            };

            expect(setSelectedCustomer(mockCustomer)).toEqual(expectedAction);
        });

        it('should create setSelectedCustomerFromOrderTransaction action', () => {
            const expectedAction = {
                type: 'customer/setSelectedCustomerFromOrderTransaction',
                payload: mockOrderTransaction
            };

            expect(setSelectedCustomerFromOrderTransaction(mockOrderTransaction)).toEqual(expectedAction);
        });

        it('should create clearSelectedCustomer action', () => {
            const expectedAction = {
                type: 'customer/clearSelectedCustomer'
            };

            expect(clearSelectedCustomer()).toEqual(expectedAction);
        });
    });

    describe('immutability', () => {
        it('should not mutate the original state when setting customer', () => {
            const initialState = {
                selectedCustomer: null
            };

            const originalState = { ...initialState };
            
            customerReducer(initialState, setSelectedCustomer(mockCustomer));

            expect(initialState).toEqual(originalState);
        });

        it('should not mutate the original state when clearing customer', () => {
            const initialState = {
                selectedCustomer: mockCustomer
            };

            const originalState = { 
                selectedCustomer: { ...mockCustomer } 
            };
            
            customerReducer(initialState, clearSelectedCustomer());

            expect(initialState).toEqual(originalState);
        });
    });
});
