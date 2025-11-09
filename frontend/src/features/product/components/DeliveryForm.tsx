import { useForm } from "react-hook-form";
import type { Delivery } from "../types/delivery";
import { useDispatch } from "react-redux";
import { setDelivery } from "../../../app/redux/slices/deliverySlice";
import "./DeliveryForm.css";

interface Props {
    onSuccess: (data: Delivery) => void;
    defaultValues?: Delivery;
}

export default function DeliveryForm({ onSuccess, defaultValues }: Props) {

    const { register, handleSubmit, formState: { errors } } = useForm<Delivery>({ defaultValues });
    const dispatch = useDispatch();

    const onSubmit = (data: Delivery) => {
        data.country = "CO"
        dispatch(setDelivery(data));
        onSuccess(data);
    }

    return (
        <div className="delivery-form active">
            <h2>Delivery</h2>
            <p>Please enter your delivery information to continue to payment</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                    <input {...register("address", { required: "Address is required" })} placeholder="Address" />
                    {errors.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
                </div>
                <div className="form-row">
                    <input {...register("city", { required: "City is required" })} placeholder="City" />
                    {errors.city && <p style={{ color: "red" }}>{errors.city.message}</p>}
                </div>
                <div className="form-row">
                    <input {...register("region", { required: "Region is required" })} placeholder="Region" />
                    {errors.region && <p style={{ color: "red" }}>{errors.region.message}</p>}
                </div>
                <div className="form-row">
                    <input type="number" {...register("postalCode", { required: "Postal code is required", pattern: { value: /^[0-9]+$/, message: "Postal code must be a number" } })} placeholder="Postal Code" />
                    {errors.postalCode && <p style={{ color: "red" }}>{errors.postalCode.message}</p>}
                </div>
                <div className="form-row">
                    <input {...register("destinataireName", { required: "Destinataire name is required" })} placeholder="Destinataire Name" />
                    {errors.destinataireName && <p style={{ color: "red" }}>{errors.destinataireName.message}</p>}
                </div>
                <button className="btn-primary" type="submit">Submit</button>
            </form>
        </div>
    );
}