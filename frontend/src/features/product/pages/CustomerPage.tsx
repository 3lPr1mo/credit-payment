import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CreditCardModal from "../components/CreditCardModal";
import DeliveryForm from "../components/DeliveryForm";
import "./CustomerPage.css";
import type { Customer } from "../types/customer";
import type { Delivery } from "../types/delivery";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { clearSelectedCustomer, setSelectedCustomer } from "../../../app/redux/slices/customerSlice";
import { clearDelivery, setDelivery } from "../../../app/redux/slices/deliverySlice";
import type { OrderTransaction } from "../types/order.transaction";
import type { StartTransactionRequest } from "../types/dto/request/start.transaction.request";
import { useFinishOrderTransactionMutation, useStartOrderTransactionMutation } from "../../../app/redux/orderTransactionApi";
import { clearOrderTransaction, setOrderTransaction } from "../../../app/redux/slices/orderTransactionSlice";
import SummaryOrder from "../components/SummaryOrder";
import FinalStatus from "../components/FinalStatus";
import { useNavigate } from "react-router-dom";
import { clearSelectedProduct } from "../../../app/redux/slices/productSlice";
import AlertModal from "../components/AlertModal";

export default function CustomerPage() {

    const [step, setStep] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showSummary, setShowSummary] = useState(true);
    const [showFinalStatus, setShowFinalStatus] = useState(true);
    const [isApiError, setIsError] = useState(false);

    const customer = useSelector((state: RootState) => state.customer.selectedCustomer)
    const delivery = useSelector((state: RootState) => state.delivery.delivery)
    const product = useSelector((state: RootState) => state.product.selectedProduct)
    const card = useSelector((state: RootState) => state.card.card)
    const orderTransaction = useSelector((state: RootState) => state.orderTransaction.orderTransaction)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [startOrderTransaction, {isLoading, isSuccess}] = useStartOrderTransactionMutation();
    const [finishOrderTransaction, {isLoading: isLoadingFinished, isSuccess: isSuccessFinished}] = useFinishOrderTransactionMutation();

    const handleNextStep = (data: Customer) => {
        dispatch(setSelectedCustomer(data));
        setStep(2);
    };

    const handleDeliverySuccess = (data: Delivery) => {
        dispatch(setDelivery(data));
        setShowModal(true);
    };

    const handleStartOrderTransaction = async () => {
        if(!customer || !delivery || !product) return;
        const request: Partial<StartTransactionRequest> = {
            quantity: 1,
            productId: product!.id,
            customer: customer!,
            delivery: delivery!,
        }
        try{
            const response: OrderTransaction = await startOrderTransaction(request).unwrap();
            dispatch(setOrderTransaction(response));
        } catch (error) {
            console.error('Error starting order transaction', error);
            setIsError(true);
        }
    }

    const handleFinishOrderTransaction = async () => {
        try {
            const response: OrderTransaction = await finishOrderTransaction({
                id: orderTransaction!.id, body: card!
            }).unwrap();
            dispatch(setOrderTransaction(response));
        } catch (error) {
            console.error('Error finishing order transaction', error);
            setIsError(true);
        }
    }

    const handleApiError = () => {
        handleCloseSummary();
        setIsError(false);
    }

    const handleCloseModal = () => setShowModal(false);
    const handleCloseSummary = () => {
        setShowSummary(false);
    };
    const handleCloseFinalStatus = () => {
        setShowSummary(false);
        setShowFinalStatus(false);
        dispatch(clearOrderTransaction());
        dispatch(clearDelivery());
        dispatch(clearSelectedCustomer());
        dispatch(clearSelectedProduct())
        navigate('/');
    }

    return (
        <div className="customer-page">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Processing your order...</p>
                </div>
            )}
            <CustomerForm onNextStep={handleNextStep} defaultValues={customer ?? undefined}/>
            {step >= 2 && (
                <div className="form-section appear">
                    <DeliveryForm onSuccess={handleDeliverySuccess} defaultValues={delivery ?? undefined}/>
                </div>
            )}
            {showModal && <CreditCardModal onClose={handleCloseModal} submit={handleStartOrderTransaction}/>}
            {isSuccess && <SummaryOrder open={showSummary} onClose={handleCloseSummary} onConfirm={handleFinishOrderTransaction}/>}
            {isLoadingFinished && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Processing your order...</p>
                </div>
            )}
            {isSuccessFinished && <FinalStatus open={showFinalStatus} onClose={handleCloseFinalStatus}/>}
            {isApiError && <AlertModal onClose={handleApiError} />}
        </div>
    );
}