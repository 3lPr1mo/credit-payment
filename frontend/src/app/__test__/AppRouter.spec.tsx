import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { router } from '../AppRouter';

// Mock de los componentes para evitar dependencias externas
vi.mock('../../features/product/pages/ProductsPage', () => ({
    default: () => <div data-testid="products-page">Products Page</div>
}));

vi.mock('../../features/product/pages/ProductPage', () => ({
    default: () => <div data-testid="product-page">Product Page</div>
}));

vi.mock('../../features/product/pages/CustomerPage', () => ({
    default: () => <div data-testid="customer-page">Customer Page</div>
}));

vi.mock('../../shared/layouts/PageLayout', () => ({
    default: () => (
        <div data-testid="page-layout">
            <div>Page Layout</div>
            <div id="outlet-content">
                <Outlet />
            </div>
        </div>
    )
}));

// Mock store para Redux
const mockStore = configureStore({
    reducer: {
        // Reducer mínimo para evitar errores
        test: (state = {}) => state
    }
});

const renderWithRouter = (route: string) => {
    const testRouter = createMemoryRouter(router.routes, {
        initialEntries: [route]
    });

    return render(
        <Provider store={mockStore}>
            <RouterProvider router={testRouter} />
        </Provider>
    );
};

describe('AppRouter', () => {
    describe('Router Configuration', () => {
        it('should have correct number of routes configured', () => {
            expect(router.routes).toHaveLength(1);
            expect(router.routes[0].children).toHaveLength(3);
        });

        it('should have PageLayout as the main layout element', () => {
            const mainRoute = router.routes[0];
            expect(mainRoute.element).toBeDefined();
        });

        it('should have correct route paths configured', () => {
            const childrenRoutes = router.routes[0].children!;
            const paths = childrenRoutes.map(route => route.path);
            
            expect(paths).toContain('/');
            expect(paths).toContain('/product/:id');
            expect(paths).toContain('/customer');
        });
    });

    describe('Route Navigation', () => {
        it('should render ProductsPage when navigating to root path', () => {
            renderWithRouter('/');
            
            expect(screen.getByTestId('page-layout')).toBeInTheDocument();
            expect(screen.getByTestId('products-page')).toBeInTheDocument();
            expect(screen.getByText('Products Page')).toBeInTheDocument();
        });

        it('should render ProductPage when navigating to product route with id', () => {
            renderWithRouter('/product/123');
            
            expect(screen.getByTestId('page-layout')).toBeInTheDocument();
            expect(screen.getByTestId('product-page')).toBeInTheDocument();
            expect(screen.getByText('Product Page')).toBeInTheDocument();
        });

        it('should render CustomerPage when navigating to customer route', () => {
            renderWithRouter('/customer');
            
            expect(screen.getByTestId('page-layout')).toBeInTheDocument();
            expect(screen.getByTestId('customer-page')).toBeInTheDocument();
            expect(screen.getByText('Customer Page')).toBeInTheDocument();
        });
    });

    describe('Layout Integration', () => {
        it('should always render PageLayout regardless of route', () => {
            // Test multiple routes to ensure layout is always present
            const routes = ['/', '/product/123', '/customer'];
            
            routes.forEach(route => {
                cleanup(); // Clean up between renders
                renderWithRouter(route);
                expect(screen.getByTestId('page-layout')).toBeInTheDocument();
                expect(screen.getByText('Page Layout')).toBeInTheDocument();
            });
        });

        it('should render page content within the layout structure', () => {
            renderWithRouter('/');
            
            // Verify layout is present
            expect(screen.getByTestId('page-layout')).toBeInTheDocument();
            
            // Verify page content is also present (indicating nested rendering)
            expect(screen.getByTestId('products-page')).toBeInTheDocument();
        });
    });

    describe('Route Parameters', () => {
        it('should handle dynamic route parameters correctly for product route', () => {
            const productIds = ['123', 'abc', 'product-456'];
            
            productIds.forEach(id => {
                cleanup(); // Clean up between renders
                renderWithRouter(`/product/${id}`);
                expect(screen.getByTestId('product-page')).toBeInTheDocument();
            });
        });
    });

    describe('Router Export', () => {
        it('should export router instance correctly', () => {
            expect(router).toBeDefined();
            expect(typeof router).toBe('object');
            expect(router.routes).toBeDefined();
        });

        it('should be a valid React Router configuration object', () => {
            expect(router).toHaveProperty('routes');
            expect(Array.isArray(router.routes)).toBe(true);
            expect(router.routes.length).toBeGreaterThan(0);
        });
    });
});
