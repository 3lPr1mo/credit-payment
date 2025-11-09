import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { formatPrice } from "../../../shared/utils/formatPrice";
import "./ProductPage.css";
import { useNavigate } from "react-router-dom";

export default function ProductPage() {
    const selectedProduct = useSelector((state: RootState) => state.product.selectedProduct);

    if(!selectedProduct){
        return <div>Product not found</div>
    }

    const navigate = useNavigate();

    return (
        <div className="product-page">
            <div className="image-container">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="details-container">
                <div className="name-description">
                    <h1 className="name">{selectedProduct.name}</h1>
                    <p className="description">{selectedProduct.description}</p>
                    <p className="reference-number">Reference: {selectedProduct.id}</p>
                </div>
                <div className="price-stock">
                    <p className="price">COP {formatPrice(selectedProduct.price)}</p>
                    <p className="stock">Stock: {selectedProduct.stock}</p>
                </div>
                <button className="pay-button" onClick={() => navigate('/customer')}>Pay with credit card</button>
            </div>
        </div>
    )
}