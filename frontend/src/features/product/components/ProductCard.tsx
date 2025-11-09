import { useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import './styles/ProductCard.css';
import { useDispatch } from "react-redux";
import { setSelectedProduct } from "../../../app/redux/slices/productSlice";
import { formatPrice } from "../../../shared/utils/formatPrice";

interface ProductProps {
    product: Product;
}

export function ProductCard({ product }: ProductProps) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleBuy = () => {
        dispatch(setSelectedProduct(product));
        navigate(`/product/${product.id}`);
    }
    

    return (
        <div className="container">
            <div className="image-container">
                <img src={product.image} alt={product.name} />
            </div>
            <div className="info-container">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">{formatPrice(product.price)}</p>
                <p className="product-stock">
                    {product.stock === 0 ? "Sin stock" : `Stock: ${product.stock}`}
                </p>
                <button 
                    className="product-button" disabled={product.stock === 0}
                    onClick={handleBuy}>
                    Buy
                </button>
            </div>
        </div>
    );
}