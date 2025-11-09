import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { PropsWithChildren } from 'react';
import { createElement } from 'react';
import { 
    productApi, 
    useGetProductsQuery 
} from '../productsApi';
import type { Product } from '../../../features/product/types/product';

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

// Test utilities
const createWrapper = () => {
    const store = configureStore({
        reducer: {
            [productApi.reducerPath]: productApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(productApi.middleware),
    });

    return ({ children }: PropsWithChildren) =>
        createElement(Provider, { store }, children);
};

describe('productsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            expect(productApi.reducerPath).toBe('productApi');
        });

        it('should have baseQuery configured', () => {
            // Test that the API has a baseQuery function configured
            expect(productApi.internalActions).toBeDefined();
            expect(productApi.reducer).toBeDefined();
            expect(productApi.middleware).toBeDefined();
        });
    });

    describe('endpoints', () => {
        it('should have getProducts endpoint', () => {
            const endpoints = productApi.endpoints;
            expect(endpoints.getProducts).toBeDefined();
        });

        it('should configure getProducts endpoint correctly', () => {
            const endpoint = productApi.endpoints.getProducts;
            expect(endpoint.name).toBe('getProducts');
        });
    });

    describe('useGetProductsQuery hook', () => {
        const mockProducts: Product[] = [
            {
                id: '1',
                name: 'Test Product 1',
                description: 'A test product description',
                stock: 10,
                price: 99.99,
                image: 'test-image-1.jpg'
            },
            {
                id: '2', 
                name: 'Test Product 2',
                description: 'Another test product description',
                stock: 5,
                price: 149.99,
                image: 'test-image-2.jpg'
            }
        ];

        beforeEach(() => {
            mockFetch.mockResolvedValue(createMockResponse(mockProducts));
        });

        it('should fetch products successfully', async () => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            // Initially loading
            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();

            // Wait for the query to complete
            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual(mockProducts);
            expect(result.current.error).toBeUndefined();
            expect(result.current.isSuccess).toBe(true);
        });

        it('should make correct API call', async () => {
            const wrapper = createWrapper();
            renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalled();
                const call = mockFetch.mock.calls[0];
                const request = call[0];
                
                // Check that it's a Request object with correct properties
                expect(request).toBeInstanceOf(Request);
                expect(request.url).toContain('/products');
                expect(request.method).toBe('GET');
            });
        });

        it('should handle API error correctly', async () => {
            const errorResponse = createMockResponse(
                { message: 'Internal Server Error' }, 
                500, 
                false
            );
            mockFetch.mockResolvedValue(errorResponse);

            const wrapper = createWrapper();
            const { result } = renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeDefined();
            expect(result.current.isError).toBe(true);
            expect(result.current.isSuccess).toBe(false);
        });

        it('should handle network error', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const wrapper = createWrapper();
            const { result } = renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toBeUndefined();
            expect(result.current.error).toBeDefined();
            expect(result.current.isError).toBe(true);
            expect(result.current.isSuccess).toBe(false);
        });

        it('should provide correct hook properties', async () => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Check all expected properties exist
            expect(typeof result.current.refetch).toBe('function');
            expect(typeof result.current.isLoading).toBe('boolean');
            expect(typeof result.current.isError).toBe('boolean');
            expect(typeof result.current.isSuccess).toBe('boolean');
            expect(typeof result.current.isFetching).toBe('boolean');
            expect(typeof result.current.isUninitialized).toBe('boolean');
        });

        it('should handle empty products array', async () => {
            mockFetch.mockResolvedValue(createMockResponse([]));

            const wrapper = createWrapper();
            const { result } = renderHook(() => useGetProductsQuery(), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual([]);
            expect(result.current.error).toBeUndefined();
            expect(result.current.isSuccess).toBe(true);
        });
    });

    describe('exports', () => {
        it('should export productApi', () => {
            expect(productApi).toBeDefined();
            expect(typeof productApi).toBe('object');
        });

        it('should export useGetProductsQuery hook', () => {
            expect(useGetProductsQuery).toBeDefined();
            expect(typeof useGetProductsQuery).toBe('function');
        });
    });
});
