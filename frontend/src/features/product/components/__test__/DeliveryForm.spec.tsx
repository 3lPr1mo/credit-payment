import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DeliveryForm from '../DeliveryForm';
import { setDelivery } from '../../../../app/redux/slices/deliverySlice';
import deliveryReducer from '../../../../app/redux/slices/deliverySlice';
import type { Delivery } from '../../types/delivery';

// Mock the dispatch function
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

// Mock only the setDelivery action, keep the reducer
vi.mock('../../../../app/redux/slices/deliverySlice', async () => {
  const actual = await vi.importActual('../../../../app/redux/slices/deliverySlice');
  return {
    ...actual,
    setDelivery: vi.fn(),
  };
});

describe('DeliveryForm', () => {
  let store: any;
  let mockOnSuccess: Mock;

  const mockDeliveryData: Delivery = {
    address: '123 Main St',
    country: 'CO',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
    destinataireName: 'John Doe',
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockOnSuccess = vi.fn();
    
    // Create a mock store
    store = configureStore({
      reducer: {
        delivery: deliveryReducer,
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <DeliveryForm onSuccess={mockOnSuccess} {...props} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render the delivery form with all required fields', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: /delivery/i })).toBeInTheDocument();
      expect(screen.getByText(/please enter your delivery information/i)).toBeInTheDocument();
      
      expect(screen.getByPlaceholderText(/address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/city/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/region/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/postal code/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/destinataire name/i)).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render with default values when provided', () => {
      renderComponent({ defaultValues: mockDeliveryData });

      expect(screen.getByDisplayValue(mockDeliveryData.address)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockDeliveryData.city)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockDeliveryData.region)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockDeliveryData.postalCode)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockDeliveryData.destinataireName)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
        expect(screen.getByText(/region is required/i)).toBeInTheDocument();
        expect(screen.getByText(/postal code is required/i)).toBeInTheDocument();
        expect(screen.getByText(/destinataire name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid postal code', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addressInput = screen.getByPlaceholderText(/address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const regionInput = screen.getByPlaceholderText(/region/i);
      const postalCodeInput = screen.getByPlaceholderText(/postal code/i);
      const nameInput = screen.getByPlaceholderText(/destinataire name/i);

      await user.type(addressInput, '123 Main St');
      await user.type(cityInput, 'Bogotá');
      await user.type(regionInput, 'Cundinamarca');
      // Since input type="number", invalid characters won't be entered, so field remains empty
      // This will trigger the "required" validation instead of pattern validation
      await user.type(postalCodeInput, 'invalid-postal');
      await user.type(nameInput, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Since input type="number" prevents invalid characters, we expect "required" error
      await waitFor(() => {
        expect(screen.getByText(/postal code is required/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should accept valid postal code with only numbers', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addressInput = screen.getByPlaceholderText(/address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const regionInput = screen.getByPlaceholderText(/region/i);
      const postalCodeInput = screen.getByPlaceholderText(/postal code/i);
      const nameInput = screen.getByPlaceholderText(/destinataire name/i);

      await user.type(addressInput, mockDeliveryData.address);
      await user.type(cityInput, mockDeliveryData.city);
      await user.type(regionInput, mockDeliveryData.region);
      await user.type(postalCodeInput, mockDeliveryData.postalCode);
      await user.type(nameInput, mockDeliveryData.destinataireName);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess and dispatch when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      (setDelivery as Mock).mockReturnValue({ type: 'delivery/setDelivery', payload: mockDeliveryData });
      
      renderComponent();

      const addressInput = screen.getByPlaceholderText(/address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const regionInput = screen.getByPlaceholderText(/region/i);
      const postalCodeInput = screen.getByPlaceholderText(/postal code/i);
      const nameInput = screen.getByPlaceholderText(/destinataire name/i);

      await user.type(addressInput, mockDeliveryData.address);
      await user.type(cityInput, mockDeliveryData.city);
      await user.type(regionInput, mockDeliveryData.region);
      await user.type(postalCodeInput, mockDeliveryData.postalCode);
      await user.type(nameInput, mockDeliveryData.destinataireName);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          address: mockDeliveryData.address,
          city: mockDeliveryData.city,
          region: mockDeliveryData.region,
          postalCode: mockDeliveryData.postalCode,
          destinataireName: mockDeliveryData.destinataireName,
          country: 'CO', // Should be automatically set
        });
      });

      expect(setDelivery).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should automatically set country to "CO" when submitting', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addressInput = screen.getByPlaceholderText(/address/i);
      const cityInput = screen.getByPlaceholderText(/city/i);
      const regionInput = screen.getByPlaceholderText(/region/i);
      const postalCodeInput = screen.getByPlaceholderText(/postal code/i);
      const nameInput = screen.getByPlaceholderText(/destinataire name/i);

      await user.type(addressInput, 'Test Address');
      await user.type(cityInput, 'Test City');
      await user.type(regionInput, 'Test Region');
      await user.type(postalCodeInput, '12345');
      await user.type(nameInput, 'Test Name');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            country: 'CO'
          })
        );
      });
    });
  });

  describe('User Interactions', () => {
    it('should clear validation errors when user starts typing in fields', async () => {
      const user = userEvent.setup();
      renderComponent();

      // First trigger validation errors
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      });

      // Then type in the address field
      const addressInput = screen.getByPlaceholderText(/address/i);
      await user.type(addressInput, 'New Address');

      // The error should disappear as user types
      await waitFor(() => {
        expect(screen.queryByText(/address is required/i)).not.toBeInTheDocument();
      });
    });

    it('should handle form submission with only enter key', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addressInput = screen.getByPlaceholderText(/address/i);
      
      // Fill out the form
      await user.type(addressInput, mockDeliveryData.address);
      await user.type(screen.getByPlaceholderText(/city/i), mockDeliveryData.city);
      await user.type(screen.getByPlaceholderText(/region/i), mockDeliveryData.region);
      await user.type(screen.getByPlaceholderText(/postal code/i), mockDeliveryData.postalCode);
      await user.type(screen.getByPlaceholderText(/destinataire name/i), mockDeliveryData.destinataireName);

      // Press enter on the form
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
