import type { Product } from "../types/product";
import './ProductCard.css';

interface ProductProps {
    product: Product;
}

export function ProductCard ({product}: ProductProps) {
    return (
        <div className="container">
            <div className="image-container">
            <img src={product.image} alt={product.name}/>
            </div>
            <div className="info-container">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">${product.price}</p>
                <p className="product-stock">
                    {product.stock === 0 ? "Sin stock" : `Stock: ${product.stock}`}
                </p>
                <button className="product-button" disabled={product.stock === 0}>Buy</button>
            </div>
        </div>
    );
}