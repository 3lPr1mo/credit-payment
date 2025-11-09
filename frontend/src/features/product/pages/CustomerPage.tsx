import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CreditCardModal from "../components/CreditCardModal";
import DeliveryForm from "../components/DeliveryForm";
import "./CustomerPage.css";
import type { Customer } from "../types/customer";
import type { Delivery } from "../types/delivery";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { setSelectedCustomer } from "../../../app/redux/slices/customerSlice";
import { setDelivery } from "../../../app/redux/slices/deliverySlice";

export default function CustomerPage() {

    const [step, setStep] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const customer = useSelector((state: RootState) => state.customer.selectedCustomer)
    const delivery = useSelector((state: RootState) => state.delivery.delivery)
    
    const dispatch = useDispatch();

    const handleNextStep = (data: Customer) => {
        dispatch(setSelectedCustomer(data));
        setStep(2);
    };

    const handleDeliverySuccess = (data: Delivery) => {
        dispatch(setDelivery(data));
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    return (
        <div className="customer-page">
            <CustomerForm onNextStep={handleNextStep} defaultValues={customer ?? undefined}/>
            {step >= 2 && (
                <div className="form-section appear">
                    <DeliveryForm onSuccess={handleDeliverySuccess} defaultValues={delivery ?? undefined}/>
                </div>
            )}
            {showModal && <CreditCardModal onClose={handleCloseModal}/>}
        </div>
    );
}