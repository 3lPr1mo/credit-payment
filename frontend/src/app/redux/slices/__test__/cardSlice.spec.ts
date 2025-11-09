import { describe, it, expect } from 'vitest';
import cardReducer, { setCard, clearCard } from '../cardSlice';
import type { CreditCard } from '../../../../features/product/types/credit.card';

describe('cardSlice', () => {
  const mockCreditCard: CreditCard = {
    number: '4111111111111111',
    cvc: '123',
    expMonth: '12',
    expYear: '2025',
    cardHolder: 'John Doe'
  };

  const initialState = {
    card: null
  };

  describe('initial state', () => {
    it('should return the initial state when called with undefined state', () => {
      const result = cardReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });

    it('should have card set to null in initial state', () => {
      const result = cardReducer(undefined, { type: 'unknown' });
      expect(result.card).toBeNull();
    });
  });

  describe('setCard action', () => {
    it('should set the card with the provided credit card data', () => {
      const result = cardReducer(initialState, setCard(mockCreditCard));
      
      expect(result.card).toEqual(mockCreditCard);
      expect(result.card?.number).toBe('4111111111111111');
      expect(result.card?.cvc).toBe('123');
      expect(result.card?.expMonth).toBe('12');
      expect(result.card?.expYear).toBe('2025');
      expect(result.card?.cardHolder).toBe('John Doe');
    });

    it('should replace existing card with new card data', () => {
      const existingCard: CreditCard = {
        number: '5555555555554444',
        cvc: '456',
        expMonth: '06',
        expYear: '2024',
        cardHolder: 'Jane Smith'
      };

      const stateWithCard = { card: existingCard };
      const result = cardReducer(stateWithCard, setCard(mockCreditCard));
      
      expect(result.card).toEqual(mockCreditCard);
      expect(result.card).not.toEqual(existingCard);
    });

    it('should handle setting card with empty string values', () => {
      const emptyCard: CreditCard = {
        number: '',
        cvc: '',
        expMonth: '',
        expYear: '',
        cardHolder: ''
      };

      const result = cardReducer(initialState, setCard(emptyCard));
      
      expect(result.card).toEqual(emptyCard);
      expect(result.card?.number).toBe('');
      expect(result.card?.cardHolder).toBe('');
    });
  });

  describe('clearCard action', () => {
    it('should clear the card and set it to null', () => {
      const stateWithCard = { card: mockCreditCard };
      const result = cardReducer(stateWithCard, clearCard());
      
      expect(result.card).toBeNull();
    });

    it('should maintain null when clearing already null card', () => {
      const result = cardReducer(initialState, clearCard());
      
      expect(result.card).toBeNull();
    });

    it('should not affect other state properties when clearing card', () => {
      const stateWithCard = { card: mockCreditCard };
      const result = cardReducer(stateWithCard, clearCard());
      
      // Verify the state structure is maintained
      expect(result).toHaveProperty('card');
      expect(Object.keys(result)).toEqual(['card']);
    });
  });

  describe('action creators', () => {
    it('should create setCard action with correct type and payload', () => {
      const action = setCard(mockCreditCard);
      
      expect(action.type).toBe('card/setCard');
      expect(action.payload).toEqual(mockCreditCard);
    });

    it('should create clearCard action with correct type', () => {
      const action = clearCard();
      
      expect(action.type).toBe('card/clearCard');
      expect(action.payload).toBeUndefined();
    });
  });

  describe('state immutability', () => {
    it('should not mutate the original state when setting card', () => {
      const originalState = { card: null };
      const result = cardReducer(originalState, setCard(mockCreditCard));
      
      expect(originalState.card).toBeNull();
      expect(result.card).toEqual(mockCreditCard);
      expect(result).not.toBe(originalState);
    });

    it('should not mutate the original state when clearing card', () => {
      const originalState = { card: mockCreditCard };
      const result = cardReducer(originalState, clearCard());
      
      expect(originalState.card).toEqual(mockCreditCard);
      expect(result.card).toBeNull();
      expect(result).not.toBe(originalState);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined payload gracefully for setCard', () => {
      // This should not happen in normal usage, but testing for robustness
      const action = { type: 'card/setCard', payload: undefined as any };
      const result = cardReducer(initialState, action);
      
      expect(result.card).toBeUndefined();
    });

    it('should handle card with special characters in cardHolder name', () => {
      const specialCard: CreditCard = {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'José María O\'Connor-Smith'
      };

      const result = cardReducer(initialState, setCard(specialCard));
      
      expect(result.card?.cardHolder).toBe('José María O\'Connor-Smith');
    });
  });
});
