import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreditCardModal from '../CreditCardModal';
import cardSlice, { setCard } from '../../../../app/redux/slices/cardSlice';

// Mock react-credit-cards-2
vi.mock('react-credit-cards-2', () => ({
  default: () => <div data-testid="credit-card">Credit Card Component</div>
}));

// Mock CSS import
vi.mock('react-credit-cards-2/dist/es/styles-compiled.css', () => ({}));
vi.mock('../styles/CreditCardModal.css', () => ({}));

const mockStore = configureStore({
  reducer: {
    card: cardSlice
  }
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('CreditCardModal', () => {
  const mockOnClose = vi.fn();
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements correctly', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      expect(screen.getByText('Card information')).toBeInTheDocument();
      expect(screen.getByTestId('credit-card')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Card number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name on card')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('YY')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('CVC')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should render checkboxes for terms and conditions', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      expect(screen.getByText(/I acknowledge that I have read the regulations/)).toBeInTheDocument();
      expect(screen.getByText(/I accept the authorization for the administration/)).toBeInTheDocument();
    });

    it('should have Confirm button disabled initially', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty card number', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cardNumberInput = screen.getByPlaceholderText('Card number');
      const form = cardNumberInput.closest('form')!;

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Card number is mandatory')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid card number pattern', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cardNumberInput = screen.getByPlaceholderText('Card number');
      const form = cardNumberInput.closest('form')!;

      fireEvent.change(cardNumberInput, { target: { value: '123' } });

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid card number')).toBeInTheDocument();
      });
    });

    it('should show validation error for empty card holder', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cardHolderInput = screen.getByPlaceholderText('Name on card');
      const form = cardHolderInput.closest('form')!;

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Name on card is mandatory')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid expiration month', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const expMonthInput = screen.getByPlaceholderText('MM');
      const form = expMonthInput.closest('form')!;

      fireEvent.change(expMonthInput, { target: { value: '13' } });

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid expiration month')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid expiration year', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const expYearInput = screen.getByPlaceholderText('YY');
      const form = expYearInput.closest('form')!;

      fireEvent.change(expYearInput, { target: { value: '23' } });

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid expiration year')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid CVC', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cvcInput = screen.getByPlaceholderText('CVC');
      const form = cvcInput.closest('form')!;

      fireEvent.change(cvcInput, { target: { value: '12' } });

      // Check both checkboxes to enable submit
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Invalid CVC')).toBeInTheDocument();
      });
    });
  });

  describe('Checkbox Functionality', () => {
    it('should enable Confirm button only when both checkboxes are checked', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      const checkboxes = screen.getAllByRole('checkbox');

      // Initially disabled
      expect(confirmButton).toBeDisabled();

      // Check first checkbox
      fireEvent.click(checkboxes[0]);
      expect(confirmButton).toBeDisabled();

      // Check second checkbox
      fireEvent.click(checkboxes[1]);
      expect(confirmButton).toBeEnabled();

      // Uncheck first checkbox
      fireEvent.click(checkboxes[0]);
      expect(confirmButton).toBeDisabled();
    });

    it('should toggle checkbox states correctly', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];

      expect(checkboxes[0].checked).toBe(false);
      expect(checkboxes[1].checked).toBe(false);

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0].checked).toBe(true);

      fireEvent.click(checkboxes[1]);
      expect(checkboxes[1].checked).toBe(true);

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0].checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call onClose and submit when form is submitted with valid data', async () => {
      const store = configureStore({
        reducer: {
          card: cardSlice
        }
      });

      const dispatchSpy = vi.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
        </Provider>
      );

      // Fill form with valid data
      fireEvent.change(screen.getByPlaceholderText('Card number'), {
        target: { value: '1234567890123456' }
      });
      fireEvent.change(screen.getByPlaceholderText('Name on card'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByPlaceholderText('MM'), {
        target: { value: '12' }
      });
      fireEvent.change(screen.getByPlaceholderText('YY'), {
        target: { value: '25' }
      });
      fireEvent.change(screen.getByPlaceholderText('CVC'), {
        target: { value: '123' }
      });

      // Check both checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          setCard({
            number: '1234567890123456',
            cardHolder: 'John Doe',
            expMonth: '12',
            expYear: '25',
            cvc: '123'
          })
        );
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Cancel button is clicked', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle focus events correctly', () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cardNumberInput = screen.getByPlaceholderText('Card number');
      const cardHolderInput = screen.getByPlaceholderText('Name on card');
      const expMonthInput = screen.getByPlaceholderText('MM');

      fireEvent.focus(cardNumberInput);
      fireEvent.focus(cardHolderInput);
      fireEvent.focus(expMonthInput);

      // These should not throw errors
      expect(cardNumberInput).toBeInTheDocument();
      expect(cardHolderInput).toBeInTheDocument();
      expect(expMonthInput).toBeInTheDocument();
    });
  });

  describe('Input Validation Patterns', () => {
    it('should accept valid card number format', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cardNumberInput = screen.getByPlaceholderText('Card number');
      fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });

      // Should not show validation error for valid number
      expect(screen.queryByText('Invalid card number')).not.toBeInTheDocument();
    });

    it('should accept valid expiration month', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const expMonthInput = screen.getByPlaceholderText('MM');
      fireEvent.change(expMonthInput, { target: { value: '01' } });

      // Should not show validation error for valid month
      expect(screen.queryByText('Invalid expiration month')).not.toBeInTheDocument();
    });

    it('should accept valid expiration year', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const expYearInput = screen.getByPlaceholderText('YY');
      fireEvent.change(expYearInput, { target: { value: '25' } });

      // Should not show validation error for valid year
      expect(screen.queryByText('Invalid expiration year')).not.toBeInTheDocument();
    });

    it('should accept valid CVC', async () => {
      renderWithProvider(
        <CreditCardModal onClose={mockOnClose} submit={mockSubmit} />
      );

      const cvcInput = screen.getByPlaceholderText('CVC');
      fireEvent.change(cvcInput, { target: { value: '123' } });

      // Should not show validation error for valid CVC
      expect(screen.queryByText('Invalid CVC')).not.toBeInTheDocument();
    });
  });
});
