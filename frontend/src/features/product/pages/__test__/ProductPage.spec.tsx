import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ProductPage from '../ProductPage';
import { formatPrice } from '../../../../shared/utils/formatPrice';

// Mock the formatPrice utility
vi.mock('../../../../shared/utils/formatPrice', () => ({
  formatPrice: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock store setup
const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'This is a test product description',
  price: 25000,
  image: 'test-image.jpg',
  stock: 10
};

const createMockStore = (selectedProduct: any) => {
  return configureStore({
    reducer: {
      product: (state = { selectedProduct }, action) => state
    }
  });
};

const renderWithProviders = (selectedProduct: any = null) => {
  const store = createMockStore(selectedProduct);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ProductPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formatPrice).mockReturnValue('25.000');
  });

  describe('When no product is selected', () => {
    it('should display "Product not found" message', () => {
      renderWithProviders(null);
      
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });

    it('should not display product details when no product is selected', () => {
      renderWithProviders(null);
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /pay with credit card/i })).not.toBeInTheDocument();
    });
  });

  describe('When a product is selected', () => {
    it('should render product image with correct src and alt attributes', () => {
      renderWithProviders(mockProduct);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockProduct.image);
      expect(image).toHaveAttribute('alt', mockProduct.name);
    });

    it('should display product name as main heading', () => {
      renderWithProviders(mockProduct);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(mockProduct.name);
    });

    it('should display product description', () => {
      renderWithProviders(mockProduct);
      
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });

    it('should display product reference number', () => {
      renderWithProviders(mockProduct);
      
      expect(screen.getByText(`Reference: ${mockProduct.id}`)).toBeInTheDocument();
    });

    it('should display formatted price with COP currency', () => {
      renderWithProviders(mockProduct);
      
      expect(formatPrice).toHaveBeenCalledWith(mockProduct.price);
      expect(screen.getByText('COP 25.000')).toBeInTheDocument();
    });

    it('should display stock information', () => {
      renderWithProviders(mockProduct);
      
      expect(screen.getByText(`Stock: ${mockProduct.stock}`)).toBeInTheDocument();
    });

    it('should render pay button with correct text', () => {
      renderWithProviders(mockProduct);
      
      const payButton = screen.getByRole('button', { name: /pay with credit card/i });
      expect(payButton).toBeInTheDocument();
      expect(payButton).toHaveClass('pay-button');
    });

    it('should navigate to /customer when pay button is clicked', () => {
      renderWithProviders(mockProduct);
      
      const payButton = screen.getByRole('button', { name: /pay with credit card/i });
      fireEvent.click(payButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/customer');
    });

    it('should apply correct CSS classes to elements', () => {
      renderWithProviders(mockProduct);
      
      expect(screen.getByText(mockProduct.name).closest('.name-description')).toBeInTheDocument();
      expect(screen.getByText('COP 25.000').closest('.price-stock')).toBeInTheDocument();
      expect(screen.getByRole('img').closest('.image-container')).toBeInTheDocument();
    });
  });

  describe('Price formatting', () => {
    it('should call formatPrice with the correct price value', () => {
      const customProduct = { ...mockProduct, price: 50000 };
      renderWithProviders(customProduct);
      
      expect(formatPrice).toHaveBeenCalledWith(50000);
    });

    it('should handle zero price', () => {
      const freeProduct = { ...mockProduct, price: 0 };
      vi.mocked(formatPrice).mockReturnValue('0');
      renderWithProviders(freeProduct);
      
      expect(formatPrice).toHaveBeenCalledWith(0);
      expect(screen.getByText('COP 0')).toBeInTheDocument();
    });
  });

  describe('Product variations', () => {
    it('should handle product with empty stock', () => {
      const noStockProduct = { ...mockProduct, stock: 0 };
      renderWithProviders(noStockProduct);
      
      expect(screen.getByText('Stock: 0')).toBeInTheDocument();
    });

    it('should handle product with long name and description', () => {
      const longNameProduct = {
        ...mockProduct,
        name: 'Very Long Product Name That Should Still Display Correctly',
        description: 'This is a very long description that should be handled properly by the component without breaking the layout or functionality'
      };
      renderWithProviders(longNameProduct);
      
      expect(screen.getByText(longNameProduct.name)).toBeInTheDocument();
      expect(screen.getByText(longNameProduct.description)).toBeInTheDocument();
    });

    it('should handle product with special characters in name', () => {
      const specialProduct = {
        ...mockProduct,
        name: 'Product with "quotes" & symbols!'
      };
      renderWithProviders(specialProduct);
      
      expect(screen.getByText(specialProduct.name)).toBeInTheDocument();
    });
  });

  describe('Component structure', () => {
    it('should have proper container structure', () => {
      renderWithProviders(mockProduct);
      
      const productPage = screen.getByText(mockProduct.name).closest('.product-page');
      expect(productPage).toBeInTheDocument();
      
      const imageContainer = screen.getByRole('img').closest('.image-container');
      expect(imageContainer).toBeInTheDocument();
      
      const detailsContainer = screen.getByText(mockProduct.name).closest('.details-container');
      expect(detailsContainer).toBeInTheDocument();
    });

    it('should not display "Product not found" when product exists', () => {
      renderWithProviders(mockProduct);
      
      expect(screen.queryByText('Product not found')).not.toBeInTheDocument();
    });
  });
});
