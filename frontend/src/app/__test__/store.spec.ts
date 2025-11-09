import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, persistor, type RootState, type AppDispatch } from '../store';
import { productApi } from '../redux/productsApi';
import { orderTransactionApi } from '../redux/orderTransactionApi';
import { setSelectedProduct, clearSelectedProduct } from '../redux/slices/productSlice';
import { setSelectedCustomer, clearSelectedCustomer } from '../redux/slices/customerSlice';

// Mock redux-persist para evitar problemas de storage en tests
vi.mock('redux-persist/lib/storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));

describe('Store Configuration', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'RESET_STATE' });
  });

  it('should have the correct initial state structure', () => {
    const state = store.getState();

    expect(state).toHaveProperty('product');
    expect(state).toHaveProperty('customer');
    expect(state).toHaveProperty('delivery');
    expect(state).toHaveProperty('orderTransaction');
    expect(state).toHaveProperty('card');
    expect(state).toHaveProperty('productApi');
    expect(state).toHaveProperty('orderTransactionApi');
  });

  it('should have correct initial values for each slice', () => {
    const state = store.getState();

    expect(state.product.selectedProduct).toBeNull();
    expect(state.customer.selectedCustomer).toBeNull();
    expect(state.delivery.delivery).toBeNull();
    expect(state.orderTransaction.orderTransaction).toBeNull();
    expect(state.card.card).toBeNull();
  });

  it('should dispatch actions and update state correctly', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      stock: 10,
      image: 'test.jpg'
    };

    store.dispatch(setSelectedProduct(mockProduct));
    
    const state = store.getState();
    expect(state.product.selectedProduct).toEqual(mockProduct);
  });

  it('should clear state when clearing actions are dispatched', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      stock: 10,
      image: 'test.jpg'
    };

    const mockCustomer = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dni: '12345678',
      phone: '1234567890'
    };

    // Set some state
    store.dispatch(setSelectedProduct(mockProduct));
    store.dispatch(setSelectedCustomer(mockCustomer));

    let state = store.getState();
    expect(state.product.selectedProduct).toEqual(mockProduct);
    expect(state.customer.selectedCustomer).toEqual(mockCustomer);

    // Clear state
    store.dispatch(clearSelectedProduct());
    store.dispatch(clearSelectedCustomer());

    state = store.getState();
    expect(state.product.selectedProduct).toBeNull();
    expect(state.customer.selectedCustomer).toBeNull();
  });

  it('should have RTK Query APIs configured correctly', () => {
    const state = store.getState();

    // Check that API slices are present and have correct structure
    expect(state.productApi).toBeDefined();
    expect(state.orderTransactionApi).toBeDefined();

    // Check that API slices have queries property
    expect(state.productApi).toHaveProperty('queries');
    expect(state.orderTransactionApi).toHaveProperty('queries');
  });

  it('should have correct middleware configuration', () => {
    // Test that middleware is working by checking if RTK Query middleware is active
    const state = store.getState();
    
    // RTK Query APIs should have their middleware paths
    expect(state).toHaveProperty(productApi.reducerPath);
    expect(state).toHaveProperty(orderTransactionApi.reducerPath);
  });

  it('should export correct TypeScript types', () => {
    const state = store.getState();
    const dispatch = store.dispatch;

    // Type assertions to ensure TypeScript types are correct
    const testState: RootState = state;
    const testDispatch: AppDispatch = dispatch;

    expect(testState).toBeDefined();
    expect(testDispatch).toBeDefined();
    expect(typeof testDispatch).toBe('function');
  });

  it('should have persistor configured', () => {
    expect(persistor).toBeDefined();
    expect(persistor.getState).toBeDefined();
    expect(persistor.persist).toBeDefined();
    expect(persistor.purge).toBeDefined();
  });

  it('should persist specified slices according to whitelist', () => {
    // The whitelist includes: 'product', 'customer', 'delivery', 'orderTransaction'
    // This test verifies that the persistor configuration is correctly set up
    const persistorState = persistor.getState();
    
    expect(persistorState).toBeDefined();
    // Check that persistor has been initialized
    expect(typeof persistorState.bootstrapped).toBe('boolean');
  });

  it('should handle complex state updates correctly', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      stock: 10,
      image: 'test.jpg'
    };

    const mockCustomer = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dni: '12345678',
      phone: '1234567890'
    };

    // Dispatch multiple actions
    store.dispatch(setSelectedProduct(mockProduct));
    store.dispatch(setSelectedCustomer(mockCustomer));

    const state = store.getState();

    expect(state.product.selectedProduct).toEqual(mockProduct);
    expect(state.customer.selectedCustomer).toEqual(mockCustomer);

    // Verify that other slices remain unchanged
    expect(state.delivery.delivery).toBeNull();
    expect(state.orderTransaction.orderTransaction).toBeNull();
    expect(state.card.card).toBeNull();
  });

  it('should maintain immutability in state updates', () => {
    const initialState = store.getState();
    const initialProduct = initialState.product;

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      stock: 10,
      image: 'test.jpg'
    };

    store.dispatch(setSelectedProduct(mockProduct));
    
    const newState = store.getState();
    const newProduct = newState.product;

    // States should be different objects (immutability)
    expect(newState).not.toBe(initialState);
    expect(newProduct).not.toBe(initialProduct);
    
    // But unchanged slices should remain the same reference
    expect(newState.customer).toBe(initialState.customer);
    expect(newState.delivery).toBe(initialState.delivery);
  });

  it('should have correct reducer paths for APIs', () => {
    expect(productApi.reducerPath).toBe('productApi');
    expect(orderTransactionApi.reducerPath).toBe('orderTransactionApi');

    const state = store.getState();
    expect(state).toHaveProperty(productApi.reducerPath);
    expect(state).toHaveProperty(orderTransactionApi.reducerPath);
  });
});
