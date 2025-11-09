import { createBrowserRouter } from "react-router-dom";
import ProductsPage from "../features/product/pages/ProductsPage";
import ProductPage from "../features/product/pages/ProductPage";
import PageLayout from "../shared/layouts/PageLayout";
import CustomerPage from "../features/product/pages/CustomerPage";

export const router = createBrowserRouter([
    {
        element: <PageLayout />,
        children: [
            {
                path: "/",
                element: <ProductsPage />
            },
            {
                path: "/product/:id",
                element: <ProductPage />
            },
            {
                path: "/customer",
                element: <CustomerPage />
            }
        ]
    }
])