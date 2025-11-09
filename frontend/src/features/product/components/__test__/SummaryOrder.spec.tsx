import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SummaryOrder from '../SummaryOrder';
import productSlice from '../../../../app/redux/slices/productSlice';
import customerSlice from '../../../../app/redux/slices/customerSlice';
import deliverySlice from '../../../../app/redux/slices/deliverySlice';
import orderTransactionSlice from '../../../../app/redux/slices/orderTransactionSlice';
import type { Product } from '../../types/product';
import type { Customer } from '../../types/customer';
import type { Delivery } from '../../types/delivery';
import type { OrderTransaction } from '../../types/order.transaction';

// Mock the formatPrice utility
vi.mock('../../../../shared/utils/formatPrice', () => ({
  formatPrice: vi.fn((price: number) => `$${price.toLocaleString('es-CO')}`)
}));

// Mock the Backdrop component
vi.mock('../Backdrop', () => ({
  default: ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => 
    open ? <div data-testid="backdrop" onClick={onClose}><div onClick={(e) => e.stopPropagation()}>{children}</div></div> : null
}));

// Mock CSS imports
vi.mock('../styles/SummaryOrder.css', () => ({}));

import { formatPrice } from '../../../../shared/utils/formatPrice';

// Mock data
const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 50000,
  stock: 10,
  image: 'test-image.jpg'
};

const mockCustomer: Customer = {
  name: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '1234567890',
  email: 'john.doe@example.com'
};

const mockDelivery: Delivery = {
  address: '123 Test Street',
  country: 'Colombia',
  city: 'Bogotá',
  region: 'Cundinamarca',
  postalCode: '110111',
  destinataireName: 'Jane Smith'
};

const mockOrderTransaction: OrderTransaction = {
  id: '1',
  paymentGatewayTransactionId: 'gateway-123',
  quantity: 1,
  product: mockProduct,
  delivery: mockDelivery,
  total: 55000,
  status: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  customer: mockCustomer
};

// Create mock store with all required slices
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      product: productSlice,
      customer: customerSlice,
      delivery: deliverySlice,
      orderTransaction: orderTransactionSlice
    },
    preloadedState: {
      product: { selectedProduct: mockProduct },
      customer: { selectedCustomer: mockCustomer },
      delivery: { delivery: mockDelivery },
      orderTransaction: { orderTransaction: mockOrderTransaction },
      ...initialState
    }
  });
};

describe('SummaryOrder', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (props = {}, storeState = {}) => {
    const store = createMockStore(storeState);
    const defaultProps = {
      open: true,
      onClose: mockOnClose,
      onConfirm: mockOnConfirm,
      ...props
    };

    return render(
      <Provider store={store}>
        <SummaryOrder {...defaultProps} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render when open is true', () => {
      renderWithProvider();
      
      expect(screen.getByTestId('backdrop')).toBeInTheDocument();
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      renderWithProvider({ open: false });
      
      expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
      expect(screen.queryByText('Order Summary')).not.toBeInTheDocument();
    });

    it('should render all sections with correct headings', () => {
      renderWithProvider();
      
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Delivery')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      renderWithProvider();
      
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Product Information Display', () => {
    it('should display product information correctly', () => {
      renderWithProvider();
      
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct.price.toLocaleString('es-CO')}`)).toBeInTheDocument();
    });

    it('should handle null product gracefully', () => {
      const storeState = {
        product: { selectedProduct: null }
      };
      
      renderWithProvider({}, storeState);
      
      expect(screen.getByText('Product')).toBeInTheDocument();
      // Should not crash and should display empty/default values
    });

    it('should format product price correctly', () => {
      renderWithProvider();
      
      expect(formatPrice).toHaveBeenCalledWith(mockProduct.price);
    });
  });

  describe('Customer Information Display', () => {
    it('should display customer information correctly', () => {
      renderWithProvider();
      
      expect(screen.getByText(`${mockCustomer.name} ${mockCustomer.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(mockCustomer.dni)).toBeInTheDocument();
      expect(screen.getByText(mockCustomer.phone)).toBeInTheDocument();
      expect(screen.getByText(mockCustomer.email)).toBeInTheDocument();
    });

    it('should handle null customer gracefully', () => {
      const storeState = {
        customer: { selectedCustomer: null }
      };
      
      renderWithProvider({}, storeState);
      
      expect(screen.getByText('Customer')).toBeInTheDocument();
      // Should not crash and should display empty/default values
    });
  });

  describe('Delivery Information Display', () => {
    it('should display delivery information correctly', () => {
      renderWithProvider();
      
      expect(screen.getByText(mockDelivery.address)).toBeInTheDocument();
      expect(screen.getByText(mockDelivery.country)).toBeInTheDocument();
      expect(screen.getByText(mockDelivery.city)).toBeInTheDocument();
      expect(screen.getByText(mockDelivery.region)).toBeInTheDocument();
      expect(screen.getByText(mockDelivery.postalCode)).toBeInTheDocument();
      expect(screen.getByText(mockDelivery.destinataireName)).toBeInTheDocument();
    });

    it('should handle null delivery gracefully', () => {
      const storeState = {
        delivery: { delivery: null }
      };
      
      renderWithProvider({}, storeState);
      
      expect(screen.getByText('Delivery')).toBeInTheDocument();
      // Should not crash and should display empty/default values
    });
  });

  describe('Order Transaction Display', () => {
    it('should display total correctly', () => {
      renderWithProvider();
      
      expect(screen.getByText(`$${mockOrderTransaction.total.toLocaleString('es-CO')}`)).toBeInTheDocument();
    });

    it('should format total price correctly', () => {
      renderWithProvider();
      
      expect(formatPrice).toHaveBeenCalledWith(mockOrderTransaction.total);
    });

    it('should handle null order transaction gracefully', () => {
      const storeState = {
        orderTransaction: { orderTransaction: null }
      };
      
      renderWithProvider({}, storeState);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(formatPrice).toHaveBeenCalledWith(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when Confirm button is clicked', () => {
      renderWithProvider();
      
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      fireEvent.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', () => {
      renderWithProvider();
      
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      renderWithProvider();
      
      const backdrop = screen.getByTestId('backdrop');
      fireEvent.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS classes', () => {
      renderWithProvider();
      
      expect(document.querySelector('.summary-order-container')).toBeInTheDocument();
      expect(document.querySelector('.summary-order-item')).toBeInTheDocument();
      expect(document.querySelector('.summary-order-actions')).toBeInTheDocument();
    });

    it('should have proper button classes', () => {
      renderWithProvider();
      
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      
      expect(confirmButton).toHaveClass('btn-primary');
      expect(cancelButton).toHaveClass('btn-secondary');
    });

    it('should render horizontal rule separator', () => {
      renderWithProvider();
      
      const hr = document.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    it('should access correct Redux state selectors', () => {
      const store = createMockStore();
      const spy = vi.spyOn(store, 'getState');
      
      render(
        <Provider store={store}>
          <SummaryOrder open={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
        </Provider>
      );
      
      expect(spy).toHaveBeenCalled();
      const state = store.getState();
      expect(state.product.selectedProduct).toEqual(mockProduct);
      expect(state.customer.selectedCustomer).toEqual(mockCustomer);
      expect(state.delivery.delivery).toEqual(mockDelivery);
      expect(state.orderTransaction.orderTransaction).toEqual(mockOrderTransaction);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings in customer data', () => {
      const customerWithEmptyData: Customer = {
        name: '',
        lastName: '',
        dni: '',
        phone: '',
        email: ''
      };
      
      const storeState = {
        customer: { selectedCustomer: customerWithEmptyData }
      };
      
      renderWithProvider({}, storeState);
      
      expect(screen.getByText('Customer')).toBeInTheDocument();
      // Should render without crashing
    });

    it('should handle zero price values', () => {
      const productWithZeroPrice: Product = {
        ...mockProduct,
        price: 0
      };
      
      const orderTransactionWithZeroTotal: OrderTransaction = {
        ...mockOrderTransaction,
        total: 0
      };
      
      const storeState = {
        product: { selectedProduct: productWithZeroPrice },
        orderTransaction: { orderTransaction: orderTransactionWithZeroTotal }
      };
      
      renderWithProvider({}, storeState);
      
      expect(formatPrice).toHaveBeenCalledWith(0);
    });
  });
});
