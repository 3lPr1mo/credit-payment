import { describe, it, expect } from 'vitest';
import orderTransactionReducer, { 
    setOrderTransaction, 
    clearOrderTransaction 
} from '../orderTransactionSlice';
import type { OrderTransaction } from '../../../../features/product/types/order.transaction';

describe('orderTransactionSlice', () => {
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
        createdAt: '2023-01-01T10:00:00Z',
        customer: {
            name: 'Juan',
            lastName: 'Pérez',
            dni: '12345678',
            phone: '+573123456789',
            email: 'juan.perez@email.com'
        }
    };

    describe('initial state', () => {
        it('should have null orderTransaction as initial state', () => {
            const initialState = orderTransactionReducer(undefined, { type: 'unknown' });
            
            expect(initialState).toEqual({
                orderTransaction: null
            });
        });
    });

    describe('setOrderTransaction', () => {
        it('should set orderTransaction when setOrderTransaction action is dispatched', () => {
            const initialState = {
                orderTransaction: null
            };

            const newState = orderTransactionReducer(
                initialState, 
                setOrderTransaction(mockOrderTransaction)
            );

            expect(newState.orderTransaction).toEqual(mockOrderTransaction);
        });

        it('should replace existing orderTransaction when setOrderTransaction is called', () => {
            const existingOrderTransaction: OrderTransaction = {
                id: 'order-456',
                paymentGatewayTransactionId: 'txn-789',
                quantity: 1,
                product: {
                    id: 'prod-2',
                    name: 'Another Product',
                    description: 'Another product description',
                    stock: 5,
                    price: 50,
                    image: 'another.jpg'
                },
                delivery: {
                    address: 'Another Address 456',
                    country: 'Colombia',
                    city: 'Another City',
                    region: 'Another Region',
                    postalCode: '54321',
                    destinataireName: 'María García'
                },
                total: 50,
                status: 'completed',
                createdAt: '2023-01-02T15:30:00Z',
                customer: {
                    name: 'María',
                    lastName: 'García',
                    dni: '87654321',
                    phone: '+573987654321',
                    email: 'maria.garcia@email.com'
                }
            };

            const initialState = {
                orderTransaction: existingOrderTransaction
            };

            const newState = orderTransactionReducer(
                initialState, 
                setOrderTransaction(mockOrderTransaction)
            );

            expect(newState.orderTransaction).toEqual(mockOrderTransaction);
            expect(newState.orderTransaction).not.toEqual(existingOrderTransaction);
        });

        it('should handle setting orderTransaction with different data types correctly', () => {
            const orderTransactionWithZeroQuantity: OrderTransaction = {
                ...mockOrderTransaction,
                quantity: 0,
                total: 0
            };

            const initialState = {
                orderTransaction: null
            };

            const newState = orderTransactionReducer(
                initialState, 
                setOrderTransaction(orderTransactionWithZeroQuantity)
            );

            expect(newState.orderTransaction?.quantity).toBe(0);
            expect(newState.orderTransaction?.total).toBe(0);
        });
    });

    describe('clearOrderTransaction', () => {
        it('should clear orderTransaction when clearOrderTransaction action is dispatched', () => {
            const initialState = {
                orderTransaction: mockOrderTransaction
            };

            const newState = orderTransactionReducer(
                initialState, 
                clearOrderTransaction()
            );

            expect(newState.orderTransaction).toBeNull();
        });

        it('should handle clearing orderTransaction when it is already null', () => {
            const initialState = {
                orderTransaction: null
            };

            const newState = orderTransactionReducer(
                initialState, 
                clearOrderTransaction()
            );

            expect(newState.orderTransaction).toBeNull();
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state when setting orderTransaction', () => {
            const initialState = {
                orderTransaction: null
            };

            const newState = orderTransactionReducer(
                initialState, 
                setOrderTransaction(mockOrderTransaction)
            );

            expect(initialState.orderTransaction).toBeNull();
            expect(newState.orderTransaction).toEqual(mockOrderTransaction);
        });

        it('should not mutate the original state when clearing orderTransaction', () => {
            const initialState = {
                orderTransaction: mockOrderTransaction
            };

            const newState = orderTransactionReducer(
                initialState, 
                clearOrderTransaction()
            );

            expect(initialState.orderTransaction).toEqual(mockOrderTransaction);
            expect(newState.orderTransaction).toBeNull();
        });
    });

    describe('action creators', () => {
        it('should create setOrderTransaction action with correct type and payload', () => {
            const action = setOrderTransaction(mockOrderTransaction);

            expect(action.type).toBe('orderTransaction/setOrderTransaction');
            expect(action.payload).toEqual(mockOrderTransaction);
        });

        it('should create clearOrderTransaction action with correct type', () => {
            const action = clearOrderTransaction();

            expect(action.type).toBe('orderTransaction/clearOrderTransaction');
            expect(action.payload).toBeUndefined();
        });
    });
});
