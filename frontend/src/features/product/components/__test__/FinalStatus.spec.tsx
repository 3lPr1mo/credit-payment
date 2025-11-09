import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FinalStatus from '../FinalStatus';
import orderTransactionSlice, { setOrderTransaction } from '../../../../app/redux/slices/orderTransactionSlice';
import type { OrderTransaction } from '../../types/order.transaction';
import type { Product } from '../../types/product';
import type { Customer } from '../../types/customer';
import type { Delivery } from '../../types/delivery';

// Mock CSS imports
vi.mock('../styles/FinalStatus.css', () => ({}));
vi.mock('../Backdrop', () => {
  return {
    default: ({ open, children }: { open: boolean; children: React.ReactNode; onClose?: () => void }) => {
      if (!open) return null;
      return (
        <div data-testid="backdrop">
          {children}
        </div>
      );
    }
  };
});

// Mock data
const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100000,
  stock: 10,
  image: 'test-image.jpg'
};

const mockCustomer: Customer = {
  email: 'test@example.com',
  name: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '1234567890'
};

const mockDelivery: Delivery = {
  address: 'Test Address',
  city: 'Test City',
  region: 'Test Region',
  postalCode: '12345',
  country: 'CO',
  destinataireName: "Test destinataire name"
};

const mockOrderTransaction: OrderTransaction = {
  id: 'order-123',
  paymentGatewayTransactionId: 'payment-456',
  quantity: 2,
  product: mockProduct,
  delivery: mockDelivery,
  total: 205000,
  status: 'APPROVED',
  createdAt: '2024-11-09T10:30:00Z',
  customer: mockCustomer
};

// Create a mock store
const createMockStore = (orderTransaction: OrderTransaction | null = null) => {
  return configureStore({
    reducer: {
      orderTransaction: orderTransactionSlice
    },
    preloadedState: {
      orderTransaction: {
        orderTransaction
      }
    }
  });
};

describe('FinalStatus', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (open = true, orderTransaction: OrderTransaction | null = null) => {
    const store = createMockStore(orderTransaction);
    return render(
      <Provider store={store}>
        <FinalStatus open={open} onClose={mockOnClose} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should not render when open is false', () => {
      renderComponent(false, mockOrderTransaction);
      
      expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
    });

    it('should render modal when open is true', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByTestId('backdrop')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
    });

    it('should render all required elements when order transaction exists', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Order ID' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByText(mockOrderTransaction.id)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should render with undefined order transaction', () => {
      renderComponent(true, null);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Order ID' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('should render approved status icon and text for APPROVED status', () => {
      const approvedTransaction = { ...mockOrderTransaction, status: 'APPROVED' };
      renderComponent(true, approvedTransaction);
      
      expect(screen.getByText('✔️')).toBeInTheDocument();
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });

    it('should render error status icon and text for ERROR status', () => {
      const errorTransaction = { ...mockOrderTransaction, status: 'ERROR' };
      renderComponent(true, errorTransaction);
      
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });

    it('should render error status icon and text for DECLINED status', () => {
      const declinedTransaction = { ...mockOrderTransaction, status: 'DECLINED' };
      renderComponent(true, declinedTransaction);
      
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('DECLINED')).toBeInTheDocument();
    });

    it('should render voided status icon and text for VOIDED status', () => {
      const voidedTransaction = { ...mockOrderTransaction, status: 'VOIDED' };
      renderComponent(true, voidedTransaction);
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('VOIDED')).toBeInTheDocument();
    });

    it('should render unknown status icon for undefined status', () => {
      const unknownTransaction = { ...mockOrderTransaction, status: undefined as any };
      renderComponent(true, unknownTransaction);
      
      expect(screen.getByText('❔')).toBeInTheDocument();
    });

    it('should render unknown status icon for unknown status', () => {
      const unknownTransaction = { ...mockOrderTransaction, status: 'UNKNOWN_STATUS' };
      renderComponent(true, unknownTransaction);
      
      expect(screen.getByText('❔')).toBeInTheDocument();
      expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
    });
  });

  describe('Order Information Display', () => {
    it('should display order ID when order transaction exists', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByText(mockOrderTransaction.id)).toBeInTheDocument();
    });

    it('should handle missing order ID gracefully', () => {
      const transactionWithoutId = { ...mockOrderTransaction, id: undefined as any };
      renderComponent(true, transactionWithoutId);
      
      // Should not throw error and should render the component
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
    });

    it('should display status text correctly', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Close button is clicked', () => {
      renderComponent(true, mockOrderTransaction);
      
      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not interfere with backdrop functionality', () => {
      renderComponent(true, mockOrderTransaction);
      
      const backdrop = screen.getByTestId('backdrop');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    it('should read order transaction from Redux state', () => {
      const store = createMockStore(mockOrderTransaction);
      
      render(
        <Provider store={store}>
          <FinalStatus open={true} onClose={mockOnClose} />
        </Provider>
      );
      
      expect(screen.getByText(mockOrderTransaction.id)).toBeInTheDocument();
      expect(screen.getByText(mockOrderTransaction.status)).toBeInTheDocument();
    });

    it('should handle empty Redux state', () => {
      const store = createMockStore(null);
      
      render(
        <Provider store={store}>
          <FinalStatus open={true} onClose={mockOnClose} />
        </Provider>
      );
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should react to Redux state changes', () => {
      const store = createMockStore(null);
      
      const { rerender } = render(
        <Provider store={store}>
          <FinalStatus open={true} onClose={mockOnClose} />
        </Provider>
      );
      
      // Initially no order ID should be displayed
      expect(screen.queryByText('order-123')).not.toBeInTheDocument();
      
      // Dispatch action to set order transaction
      act(() => {
        store.dispatch(setOrderTransaction(mockOrderTransaction));
      });
      
      rerender(
        <Provider store={store}>
          <FinalStatus open={true} onClose={mockOnClose} />
        </Provider>
      );
      
      // Now order ID should be displayed
      expect(screen.getByText('order-123')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct CSS classes and structure', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' }).closest('.final-status-container')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Order ID' }).closest('.final-status-item')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' }).closest('.final-status-actions')).toBeInTheDocument();
    });

    it('should render horizontal rule separator', () => {
      const { container } = renderComponent(true, mockOrderTransaction);
      
      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });

    it('should render status icon with correct CSS class', () => {
      renderComponent(true, mockOrderTransaction);
      
      const statusIcon = screen.getByText('✔️').closest('.status-icon.approved');
      expect(statusIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Order ID' })).toBeInTheDocument();
    });

    it('should have accessible button', () => {
      renderComponent(true, mockOrderTransaction);
      
      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('btn-primary');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all status variations correctly', () => {
      const statuses = [
        { status: 'APPROVED', icon: '✔️', class: 'approved' },
        { status: 'ERROR', icon: '❌', class: 'error' },
        { status: 'DECLINED', icon: '❌', class: 'error' },
        { status: 'VOIDED', icon: '⚠️', class: 'voided' },
        { status: 'PENDING', icon: '❔', class: 'unknown' },
        { status: '', icon: '❔', class: 'unknown' },
      ];
      
      statuses.forEach(({ status, icon, class: expectedClass }) => {
        const transaction = { ...mockOrderTransaction, status };
        const { unmount } = renderComponent(true, transaction);
        
        expect(screen.getByText(icon)).toBeInTheDocument();
        expect(screen.getByText(icon).closest(`.status-icon.${expectedClass}`)).toBeInTheDocument();
        
        if (status) {
          expect(screen.getByText(status)).toBeInTheDocument();
        }
        
        unmount();
      });
    });

    it('should handle component remounting correctly', () => {
      // First render
      const { unmount } = renderComponent(true, mockOrderTransaction);
      
      // Verify it renders correctly
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      
      // Unmount component
      unmount();
      
      // Render a new instance
      renderComponent(true, mockOrderTransaction);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Order Status' })).toBeInTheDocument();
      expect(screen.getByText(mockOrderTransaction.id)).toBeInTheDocument();
    });
  });
});
