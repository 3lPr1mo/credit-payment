import { useSelector } from "react-redux";
import Backdrop from "./Backdrop";
import type { RootState } from "../../../app/store";

interface Props {
    open: boolean,
    onClose: () => void
}

export default function FinalStatus({ open, onClose }: Props) {

    const orderTransaction = useSelector((state: RootState) => state.orderTransaction.orderTransaction)

    const renderStatusIcon = (status?: string) => {
        switch (status) {
            case "APPROVED":
                return <span className="status-icon approved">✔️</span>;
            case "ERROR":
            case "DECLINED":
                return <span className="status-icon error">❌</span>;
            case "VOIDED":
                return <span className="status-icon voided">⚠️</span>;
            default:
                return <span className="status-icon unknown">❔</span>;
        }
    };

    return (
        <Backdrop open={open} onClose={onClose}>
            <div className="final-status-container">
                <h2>Order Status</h2>
                <hr/>
                <div className="final-status-item">
                    <h4>Order ID</h4>
                    <p>{orderTransaction?.id}</p>
                </div>
                <div className="final-status-item">
                    <h4>Order Status</h4>
                    <p>{renderStatusIcon(orderTransaction?.status)}</p>
                    <p>{orderTransaction?.status}</p>
                </div>
                <div className="final-status-actions">
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </Backdrop>
    );
}