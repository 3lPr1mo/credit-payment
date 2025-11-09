import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PageLayout from '../PageLayout';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
  };
});

// Helper para renderizar con router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('PageLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render the page layout with default title', () => {
      renderWithRouter(<PageLayout />);
      
      expect(screen.getByText('Credit Payment')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      const customTitle = 'Custom Page Title';
      renderWithRouter(<PageLayout title={customTitle} />);
      
      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.queryByText('Credit Payment')).not.toBeInTheDocument();
    });

    it('should render the page layout structure correctly', () => {
      renderWithRouter(<PageLayout />);
      
      // Check for main structural elements
      const layout = screen.getByRole('navigation').parentElement;
      expect(layout).toHaveClass('page-layout');
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('navbar');
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('page-content');
    });
  });

  describe('Navigation', () => {
    it('should navigate to home when title is clicked', () => {
      renderWithRouter(<PageLayout />);
      
      const title = screen.getByText('Credit Payment');
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to home when custom title is clicked', () => {
      const customTitle = 'My Custom Title';
      renderWithRouter(<PageLayout title={customTitle} />);
      
      const title = screen.getByText(customTitle);
      fireEvent.click(title);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should have clickable title with proper styling', () => {
      renderWithRouter(<PageLayout />);
      
      const title = screen.getByText('Credit Payment');
      expect(title).toHaveClass('page-title');
      expect(title.tagName).toBe('H1');
    });
  });

  describe('Cart Button', () => {
    it('should render cart button with icon and count', () => {
      renderWithRouter(<PageLayout />);
      
      const cartButton = screen.getByRole('button', { name: /carrito de compras/i });
      expect(cartButton).toBeInTheDocument();
      expect(cartButton).toHaveClass('cart-button');
      
      // Check for cart count
      expect(screen.getByText('0')).toBeInTheDocument();
      
      // Check for SVG icon
      const svg = cartButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('cart-icon');
    });

    it('should have proper aria-label for accessibility', () => {
      renderWithRouter(<PageLayout />);
      
      const cartButton = screen.getByLabelText('Carrito de compras');
      expect(cartButton).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render children when provided', () => {
      const testContent = <div data-testid="test-children">Test Children</div>;
      renderWithRouter(<PageLayout>{testContent}</PageLayout>);
      
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByText('Test Children')).toBeInTheDocument();
      
      // Should not render Outlet when children are provided
      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });

    it('should render Outlet when no children provided', () => {
      renderWithRouter(<PageLayout />);
      
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByText('Outlet Content')).toBeInTheDocument();
    });

    it('should prioritize children over Outlet when both could be present', () => {
      const testContent = <div data-testid="test-children">Children Content</div>;
      renderWithRouter(<PageLayout>{testContent}</PageLayout>);
      
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });
  });

  describe('Navbar Structure', () => {
    it('should have correct navbar structure', () => {
      renderWithRouter(<PageLayout />);
      
      const navbar = screen.getByRole('navigation');
      const navbarContent = navbar.querySelector('.navbar-content');
      expect(navbarContent).toBeInTheDocument();
      
      const navbarActions = navbar.querySelector('.navbar-actions');
      expect(navbarActions).toBeInTheDocument();
    });

    it('should contain title and cart button in navbar', () => {
      renderWithRouter(<PageLayout />);
      
      const navbar = screen.getByRole('navigation');
      
      // Title should be in navbar
      const title = screen.getByText('Credit Payment');
      expect(navbar).toContainElement(title);
      
      // Cart button should be in navbar
      const cartButton = screen.getByLabelText('Carrito de compras');
      expect(navbar).toContainElement(cartButton);
    });
  });

  describe('Props Interface', () => {
    it('should handle undefined children prop', () => {
      renderWithRouter(<PageLayout children={undefined} />);
      
      // Should render Outlet when children is explicitly undefined
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      renderWithRouter(<PageLayout title="" />);
      
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toHaveTextContent('');
    });

    it('should handle multiple children', () => {
      renderWithRouter(
        <PageLayout>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
        </PageLayout>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct CSS classes to elements', () => {
      renderWithRouter(<PageLayout />);
      
      // Check main container
      const navbar = screen.getByRole('navigation');
      const layout = navbar.parentElement;
      expect(layout).toHaveClass('page-layout');
      
      // Check navbar classes
      expect(navbar).toHaveClass('navbar');
      expect(navbar.firstChild).toHaveClass('navbar-content');
      
      // Check title class
      const title = screen.getByText('Credit Payment');
      expect(title).toHaveClass('page-title');
      
      // Check cart elements
      const cartButton = screen.getByLabelText('Carrito de compras');
      expect(cartButton).toHaveClass('cart-button');
      
      const cartIcon = cartButton.querySelector('svg');
      expect(cartIcon).toHaveClass('cart-icon');
      
      const cartCount = cartButton.querySelector('.cart-count');
      expect(cartCount).toHaveClass('cart-count');
      
      // Check main content
      const main = screen.getByRole('main');
      expect(main).toHaveClass('page-content');
    });
  });
});
