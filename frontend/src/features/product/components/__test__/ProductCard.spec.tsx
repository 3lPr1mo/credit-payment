import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { Product } from '../../types/product';

// Mocks
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('../../../../app/redux/slices/productSlice', () => ({
  setSelectedProduct: vi.fn((product) => ({ type: 'SET_SELECTED_PRODUCT', payload: product })),
}));

vi.mock('../../../../shared/utils/formatPrice', () => ({
  formatPrice: vi.fn((price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }),
}));

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'This is a test product description',
    price: 15000,
    stock: 5,
    image: 'https://example.com/image.jpg',
  };

  const mockProductOutOfStock: Product = {
    ...mockProduct,
    id: '2',
    name: 'Out of Stock Product',
    stock: 0,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render product information correctly', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('This is a test product description')).toBeInTheDocument();
      expect(screen.getByText('$ 15.000')).toBeInTheDocument();
      expect(screen.getByText('Stock: 5')).toBeInTheDocument();
      expect(screen.getByAltText('Test Product')).toBeInTheDocument();
    });

    it('should render product image with correct src and alt attributes', () => {
      render(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Product');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Product');
    });

    it('should render Buy button when product has stock', () => {
      render(<ProductCard product={mockProduct} />);

      const buyButton = screen.getByRole('button', { name: /buy/i });
      expect(buyButton).toBeInTheDocument();
      expect(buyButton).not.toBeDisabled();
    });

    it('should display "Sin stock" when product stock is 0', () => {
      render(<ProductCard product={mockProductOutOfStock} />);

      expect(screen.getByText('Sin stock')).toBeInTheDocument();
      expect(screen.queryByText(/Stock:/)).not.toBeInTheDocument();
    });

    it('should disable Buy button when product stock is 0', () => {
      render(<ProductCard product={mockProductOutOfStock} />);

      const buyButton = screen.getByRole('button', { name: /buy/i });
      expect(buyButton).toBeDisabled();
    });
  });

  describe('Functionality', () => {
    it('should call dispatch with setSelectedProduct and navigate when Buy button is clicked', async () => {
      const { setSelectedProduct } = await import('../../../../app/redux/slices/productSlice');
      
      render(<ProductCard product={mockProduct} />);

      const buyButton = screen.getByRole('button', { name: /buy/i });
      fireEvent.click(buyButton);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(setSelectedProduct).toHaveBeenCalledWith(mockProduct);
      expect(mockNavigate).toHaveBeenCalledWith('/product/1');
    });

    it('should not allow clicking Buy button when product is out of stock', () => {
      render(<ProductCard product={mockProductOutOfStock} />);

      const buyButton = screen.getByRole('button', { name: /buy/i });
      fireEvent.click(buyButton);

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call formatPrice with correct price', async () => {
      const { formatPrice } = await import('../../../../shared/utils/formatPrice');
      
      render(<ProductCard product={mockProduct} />);

      expect(formatPrice).toHaveBeenCalledWith(15000);
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to elements', () => {
      render(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test Product').closest('.container')).toBeInTheDocument();
      expect(screen.getByAltText('Test Product').closest('.image-container')).toBeInTheDocument();
      expect(screen.getByText('Test Product').closest('.info-container')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toHaveClass('product-name');
      expect(screen.getByText('This is a test product description')).toHaveClass('product-description');
      expect(screen.getByText('$ 15.000')).toHaveClass('product-price');
      expect(screen.getByText('Stock: 5')).toHaveClass('product-stock');
      expect(screen.getByRole('button', { name: /buy/i })).toHaveClass('product-button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with empty strings gracefully', () => {
      const emptyProduct: Product = {
        ...mockProduct,
        name: '',
        description: '',
        image: '',
      };

      render(<ProductCard product={emptyProduct} />);

      expect(screen.getByAltText('')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument();
    });

    it('should handle product with very large stock number', () => {
      const largeStockProduct: Product = {
        ...mockProduct,
        stock: 999999,
      };

      render(<ProductCard product={largeStockProduct} />);

      expect(screen.getByText('Stock: 999999')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /buy/i })).not.toBeDisabled();
    });

    it('should handle product with very large price', async () => {
      const { formatPrice } = await import('../../../../shared/utils/formatPrice');
      const expensiveProduct: Product = {
        ...mockProduct,
        price: 999999999,
      };

      render(<ProductCard product={expensiveProduct} />);

      expect(formatPrice).toHaveBeenCalledWith(999999999);
    });

    it('should handle multiple rapid clicks on Buy button', () => {
      render(<ProductCard product={mockProduct} />);

      const buyButton = screen.getByRole('button', { name: /buy/i });
      
      // Simulate rapid clicks
      fireEvent.click(buyButton);
      fireEvent.click(buyButton);
      fireEvent.click(buyButton);

      // Should call dispatch and navigate for each click
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });
  });
});
