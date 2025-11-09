import { useSelector } from "react-redux";
import Backdrop from "./Backdrop";
import "./styles/SummaryOrder.css";
import type { RootState } from "../../../app/store";
import { formatPrice } from "../../../shared/utils/formatPrice";

interface Props {
    open: boolean,
    onClose: () => void,
    onConfirm: () => void
}

export default function SummaryOrder({ open, onClose, onConfirm }: Props) {

    const product = useSelector((state: RootState) => state.product.selectedProduct);
    const customer = useSelector((state: RootState) => state.customer.selectedCustomer);
    const delivery = useSelector((state: RootState) => state.delivery.delivery);
    const orderTransaction = useSelector((state: RootState) => state.orderTransaction.orderTransaction);

    return (
        <Backdrop open={open} onClose={onClose}>
            <div className="summary-order-container">
                <h2>Order Summary</h2>
                <hr/>
                <div className="summary-order-item">
                    <h4>Product</h4>
                    <p>{product?.name}</p>
                    <p>{product?.description}</p>
                    <p>{formatPrice(product?.price ?? 0)}</p>
                </div>
                <div className="summary-order-item">
                    <h4>Customer</h4>
                    <p>{customer?.name} {customer?.lastName}</p>
                    <p>{customer?.dni}</p>
                    <p>{customer?.phone}</p>
                    <p>{customer?.email}</p>
                </div>
                <div className="summary-order-item">
                    <h4>Delivery</h4>
                    <p>{delivery?.address}</p>
                    <p>{delivery?.country}</p>
                    <p>{delivery?.city}</p>
                    <p>{delivery?.region}</p>
                    <p>{delivery?.postalCode}</p>
                    <p>{delivery?.destinataireName}</p>
                </div>
                <div className="summary-order-item">
                    <h4>Total</h4>
                    <p>{formatPrice(orderTransaction?.total ?? 0)}</p>
                </div>
                <div className="summary-order-actions">
                    <button className="btn-primary" onClick={onConfirm}>Confirm</button>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </Backdrop>
    );
}