import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerForm from '../CustomerForm';
import customerSlice, { setSelectedCustomer } from '../../../../app/redux/slices/customerSlice';
import type { Customer } from '../../types/customer';

// Mock data
const mockCustomer: Customer = {
  email: 'test@example.com',
  name: 'John',
  lastName: 'Doe',
  dni: '12345678',
  phone: '1234567890'
};

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      customer: customerSlice
    }
  });
};

// Mock onNextStep function
const mockOnNextStep = vi.fn();

describe('CustomerForm', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    mockOnNextStep.mockClear();
    vi.clearAllMocks();
  });

  const renderComponent = (defaultValues?: Customer) => {
    return render(
      <Provider store={store}>
        <CustomerForm onNextStep={mockOnNextStep} defaultValues={defaultValues} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render the form with all required fields', () => {
      renderComponent();

      expect(screen.getByText('Identification')).toBeInTheDocument();
      expect(screen.getByText('Please enter your information to continue to payment')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Legal id number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to delivery' })).toBeInTheDocument();
    });

    it('should render with default values when provided', () => {
      renderComponent(mockCustomer);

      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });
  });

  describe('Field Validations', () => {
    it('should show error when email is empty', async () => {
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is mandatory')).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should show error when first name is empty', async () => {
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is mandatory')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Last name is mandatory')).toBeInTheDocument();
      });
    });

    it('should show error when DNI is empty', async () => {
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('DNI is mandatory')).toBeInTheDocument();
      });
    });

    it('should show error when DNI is not a number', async () => {
      renderComponent();
      
      const dniInput = screen.getByPlaceholderText('Legal id number');
      fireEvent.change(dniInput, { target: { value: 'abc123' } });
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('DNI must be a number')).toBeInTheDocument();
      });
    });

    it('should show error when phone is empty', async () => {
      renderComponent();
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number is mandatory')).toBeInTheDocument();
      });
    });

    it('should show error when phone is not a number', async () => {
      renderComponent();
      
      const phoneInput = screen.getByPlaceholderText('Phone number');
      fireEvent.change(phoneInput, { target: { value: 'abc123456789' } }); // More than 10 chars to bypass length validation
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number must be a number')).toBeInTheDocument();
      });
    });

    it('should show error when phone number is less than 10 digits', async () => {
      renderComponent();
      
      const phoneInput = screen.getByPlaceholderText('Phone number');
      fireEvent.change(phoneInput, { target: { value: '123456789' } });
      
      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number must be at least 10 digits')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should successfully submit form with valid data', async () => {
      renderComponent();

      // Fill all required fields
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: mockCustomer.email } });
      fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: mockCustomer.name } });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: mockCustomer.lastName } });
      fireEvent.change(screen.getByPlaceholderText('Legal id number'), { target: { value: mockCustomer.dni } });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: mockCustomer.phone } });

      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnNextStep).toHaveBeenCalledWith(mockCustomer);
      });
    });

    it('should dispatch setSelectedCustomer action on form submission', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      renderComponent();

      // Fill all required fields
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: mockCustomer.email } });
      fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: mockCustomer.name } });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: mockCustomer.lastName } });
      fireEvent.change(screen.getByPlaceholderText('Legal id number'), { target: { value: mockCustomer.dni } });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: mockCustomer.phone } });

      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedCustomer(mockCustomer));
      });
    });

    it('should disable button after form submission', async () => {
      renderComponent();

      // Fill all required fields
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: mockCustomer.email } });
      fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: mockCustomer.name } });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: mockCustomer.lastName } });
      fireEvent.change(screen.getByPlaceholderText('Legal id number'), { target: { value: mockCustomer.dni } });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: mockCustomer.phone } });

      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      
      expect(submitButton).toBeInTheDocument();
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Go to delivery' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should not submit form when validation errors exist', async () => {
      renderComponent();

      // Only fill email field, leave others empty
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: mockCustomer.email } });

      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is mandatory')).toBeInTheDocument();
        expect(screen.getByText('Last name is mandatory')).toBeInTheDocument();
        expect(screen.getByText('DNI is mandatory')).toBeInTheDocument();
        expect(screen.getByText('Phone number is mandatory')).toBeInTheDocument();
      });

      expect(mockOnNextStep).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      for (const email of validEmails) {
        const { unmount } = renderComponent(); // Get unmount function
        
        const emailInput = screen.getByPlaceholderText('Email');
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'User' } });
        fireEvent.change(screen.getByPlaceholderText('Legal id number'), { target: { value: '12345678' } });
        fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: '1234567890' } });

        const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
        });

        // Properly unmount component before next iteration
        unmount();
      }
    });

    it('should accept valid phone numbers with exactly 10 digits', async () => {
      renderComponent();

      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'User' } });
      fireEvent.change(screen.getByPlaceholderText('Legal id number'), { target: { value: '12345678' } });
      fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: '1234567890' } });

      const submitButton = screen.getByRole('button', { name: 'Go to delivery' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Phone number must be at least 10 digits')).not.toBeInTheDocument();
        expect(mockOnNextStep).toHaveBeenCalled();
      });
    });
  });
});
