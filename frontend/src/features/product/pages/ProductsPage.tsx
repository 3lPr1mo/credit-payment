import { useGetProductsQuery } from "../../../app/redux/productsApi"
import { ProductCard } from "../components/ProductCard"

export default function ProductsPage() {

    const {data: products, error, isLoading} = useGetProductsQuery();
    
    if(isLoading) return <div>Loading...</div>;
    if(error) return <div>Error loading products</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}