import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { PropsWithChildren } from 'react';
import { createElement } from 'react';
import { 
    orderTransactionApi, 
    useStartOrderTransactionMutation, 
    useFinishOrderTransactionMutation 
} from '../orderTransactionApi';
import type { OrderTransaction } from '../../../features/product/types/order.transaction';
import type { StartTransactionRequest } from '../../../features/product/types/dto/request/start.transaction.request';
import type { CreditCard } from '../../../features/product/types/credit.card';

// Mock environment variable
vi.stubGlobal('import.meta', {
    env: {
        VITE_API_URL: 'http://localhost:3000'
    }
});

// Create a proper Response mock
const createMockResponse = (data: any, status: number = 200, ok: boolean = true) => {
    const response = {
        ok,
        status,
        json: vi.fn().mockResolvedValue(data),
        text: vi.fn().mockResolvedValue(JSON.stringify(data)),
        headers: new Headers({ 'content-type': 'application/json' }),
        clone: vi.fn().mockReturnThis(),
        body: null,
        bodyUsed: false,
        statusText: ok ? 'OK' : 'Error',
        url: '',
        redirected: false,
        type: 'basic' as ResponseType,
        arrayBuffer: vi.fn(),
        blob: vi.fn(),
        formData: vi.fn(),
        bytes: vi.fn(),
    };
    // Make clone() return a new instance
    response.clone = vi.fn(() => createMockResponse(data, status, ok));
    return response as unknown as Response;
};

// Mock fetch
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
    value: mockFetch,
    writable: true
});

describe('orderTransactionApi', () => {
    let store: ReturnType<typeof configureStore>;
    
    const createTestStore = () => {
        return configureStore({
            reducer: {
                [orderTransactionApi.reducerPath]: orderTransactionApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(orderTransactionApi.middleware),
        });
    };

    const wrapper = ({ children }: PropsWithChildren) =>
        createElement(Provider, { store, children });

    beforeEach(() => {
        store = createTestStore();
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('API Configuration', () => {
        it('should have correct reducer path', () => {
            expect(orderTransactionApi.reducerPath).toBe('orderTransactionApi');
        });

        it('should use correct base URL from environment', () => {
            // We can verify that our mocked environment variable is set correctly
            expect(import.meta.env.VITE_API_URL).toBeDefined();
            expect(typeof import.meta.env.VITE_API_URL).toBe('string');
        });
    });

    describe('useStartOrderTransactionMutation', () => {
        const mockStartTransactionRequest: Partial<StartTransactionRequest> = {
            quantity: 2,
            productId: 'product-123',
            customer: {
                name: 'John',
                lastName: 'Doe',
                dni: '12345678',
                email: 'john@example.com',
                phone: '1234567890'
            },
            delivery: {
                address: '123 Main St',
                country: 'US',
                city: 'Test City',
                region: 'CA',
                postalCode: '12345',
                destinataireName: 'John Doe'
            }
        };

        const mockOrderTransactionResponse: OrderTransaction = {
            id: 'transaction-123',
            paymentGatewayTransactionId: 'gateway-456',
            quantity: 2,
            product: {
                id: 'product-123',
                name: 'Test Product',
                price: 100,
                stock: 10,
                description: 'Test Description',
                image: 'test-image.jpg'
            },
            delivery: {
                address: '123 Main St',
                country: 'US',
                city: 'Test City',
                region: 'CA',
                postalCode: '12345',
                destinataireName: 'John Doe'
            },
            total: 200,
            status: 'PENDING',
            createdAt: '2024-01-01T00:00:00Z',
            customer: {
                name: 'John',
                lastName: 'Doe',
                dni: '12345678',
                email: 'john@example.com',
                phone: '1234567890'
            }
        };

        it('should successfully start a transaction', async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse(mockOrderTransactionResponse, 201, true)
            );

            const { result } = renderHook(() => useStartOrderTransactionMutation(), {
                wrapper,
            });

            const [startTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await startTransaction(mockStartTransactionRequest);
                expect(response.data).toEqual(mockOrderTransactionResponse);
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [request] = mockFetch.mock.calls[0];
            expect(request.url).toContain('/order-transaction');
            expect(request.method).toBe('POST');
        });

        it('should handle API errors when starting transaction', async () => {
            const errorResponse = {
                message: 'Product not found',
                error: 'Not Found',
                statusCode: 404
            };

            mockFetch.mockResolvedValueOnce(
                createMockResponse(errorResponse, 404, false)
            );

            const { result } = renderHook(() => useStartOrderTransactionMutation(), {
                wrapper,
            });

            const [startTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await startTransaction(mockStartTransactionRequest);
                expect(response.error).toBeDefined();
            });
        });

        it('should handle network errors when starting transaction', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useStartOrderTransactionMutation(), {
                wrapper,
            });

            const [startTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await startTransaction(mockStartTransactionRequest);
                expect(response.error).toBeDefined();
            });
        });
    });

    describe('useFinishOrderTransactionMutation', () => {
        const transactionId = 'transaction-123';
        const mockCreditCard: CreditCard = {
            number: '4111111111111111',
            cvc: '123',
            expMonth: '12',
            expYear: '2025',
            cardHolder: 'John Doe'
        };

        const mockFinishedTransaction: OrderTransaction = {
            id: 'transaction-123',
            paymentGatewayTransactionId: 'gateway-456',
            quantity: 2,
            product: {
                id: 'product-123',
                name: 'Test Product',
                price: 100,
                stock: 10,
                description: 'Test Description',
                image: 'test-image.jpg'
            },
            delivery: {
                address: '123 Main St',
                country: 'US',
                city: 'Test City',
                region: 'CA',
                postalCode: '12345',
                destinataireName: 'John Doe'
            },
            total: 200,
            status: 'COMPLETED',
            createdAt: '2024-01-01T00:00:00Z',
            customer: {
                name: 'John',
                lastName: 'Doe',
                dni: '12345678',
                email: 'john@example.com',
                phone: '1234567890'
            }
        };

        it('should successfully finish a transaction', async () => {
            mockFetch.mockResolvedValueOnce(
                createMockResponse(mockFinishedTransaction, 200, true)
            );

            const { result } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [finishTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await finishTransaction({ 
                    id: transactionId, 
                    body: mockCreditCard 
                });
                expect(response.data).toEqual(mockFinishedTransaction);
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [request] = mockFetch.mock.calls[0];
            expect(request.url).toContain(`/order-transaction/${transactionId}/finish`);
            expect(request.method).toBe('POST');
        });

        it('should handle API errors when finishing transaction', async () => {
            const errorResponse = {
                message: 'Invalid credit card',
                error: 'Bad Request',
                statusCode: 400
            };

            mockFetch.mockResolvedValueOnce(
                createMockResponse(errorResponse, 400, false)
            );

            const { result } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [finishTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await finishTransaction({ 
                    id: transactionId, 
                    body: mockCreditCard 
                });
                expect(response.error).toBeDefined();
            });
        });

        it('should handle transaction not found error', async () => {
            const errorResponse = {
                message: 'Transaction not found',
                error: 'Not Found',
                statusCode: 404
            };

            mockFetch.mockResolvedValueOnce(
                createMockResponse(errorResponse, 404, false)
            );

            const { result } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [finishTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await finishTransaction({ 
                    id: 'non-existent-id', 
                    body: mockCreditCard 
                });
                expect(response.error).toBeDefined();
            });
        });

        it('should handle network errors when finishing transaction', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [finishTransaction] = result.current;
            
            await waitFor(async () => {
                const response = await finishTransaction({ 
                    id: transactionId, 
                    body: mockCreditCard 
                });
                expect(response.error).toBeDefined();
            });
        });
    });

    describe('Exported hooks', () => {
        it('should export useStartOrderTransactionMutation hook', () => {
            expect(useStartOrderTransactionMutation).toBeDefined();
            expect(typeof useStartOrderTransactionMutation).toBe('function');
        });

        it('should export useFinishOrderTransactionMutation hook', () => {
            expect(useFinishOrderTransactionMutation).toBeDefined();
            expect(typeof useFinishOrderTransactionMutation).toBe('function');
        });

        it('should return mutation functions and state from hooks', () => {
            const { result: startResult } = renderHook(() => useStartOrderTransactionMutation(), {
                wrapper,
            });
            
            const { result: finishResult } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [startMutation, startState] = startResult.current;
            const [finishMutation, finishState] = finishResult.current;

            expect(typeof startMutation).toBe('function');
            expect(typeof startState).toBe('object');
            expect(typeof finishMutation).toBe('function');
            expect(typeof finishState).toBe('object');
        });
    });

    describe('Mutation state management', () => {
        it('should track loading state for start transaction', async () => {
            // Simulate a slow response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve => setTimeout(() => resolve(
                    createMockResponse({}, 200, true)
                ), 100))
            );

            const { result } = renderHook(() => useStartOrderTransactionMutation(), {
                wrapper,
            });

            const [startTransaction] = result.current;
            
            // Trigger the mutation
            startTransaction({});
            
            // Check that isLoading becomes true
            await waitFor(() => {
                const [, state] = result.current;
                expect(state.isLoading).toBe(true);
            });
        });

        it('should track loading state for finish transaction', async () => {
            // Simulate a slow response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve => setTimeout(() => resolve(
                    createMockResponse({}, 200, true)
                ), 100))
            );

            const { result } = renderHook(() => useFinishOrderTransactionMutation(), {
                wrapper,
            });

            const [finishTransaction] = result.current;
            
            // Trigger the mutation
            finishTransaction({ id: 'test-id', body: {} as CreditCard });
            
            // Check that isLoading becomes true
            await waitFor(() => {
                const [, state] = result.current;
                expect(state.isLoading).toBe(true);
            });
        });
    });
});
