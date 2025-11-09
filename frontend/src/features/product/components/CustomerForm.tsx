import { useForm } from "react-hook-form";
import "./styles/CustomerForm.css";
import type { Customer } from "../types/customer";
import { useDispatch } from "react-redux";
import { setSelectedCustomer } from "../../../app/redux/slices/customerSlice";
import { useState } from "react";

interface Props {
    onNextStep: (data: Customer) => void;
    defaultValues?: Customer;
}

export default function CustomerForm({ onNextStep, defaultValues }: Props) {

    const { register, handleSubmit, formState: { errors } } = useForm<Customer>({ defaultValues });
    const dispatch = useDispatch();
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const onSubmit = (data: Customer) => {
        setButtonDisabled(true);
        dispatch(setSelectedCustomer(data));
        onNextStep(data);
    }

    return (
        <div className="form-box active">
            <h2>Identification</h2>
            <p>Please enter your information to continue to payment</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                    <input
                        {...register("email", {
                            required: "Email is mandatory",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                        },)
                        }
                        placeholder="Email" />
                    {errors.email && <p style={{ color: "red" }}>{errors.email?.message}</p>}
                </div>
                <div className="form-row">
                    <input {...register("name", { required: "First name is mandatory" })} placeholder="First Name" />
                    {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
                </div>
                <div className="form-row">
                    <input {...register("lastName", { required: "Last name is mandatory" })} placeholder="Last Name" />
                    {errors.lastName && <p style={{ color: "red" }}>{errors.lastName?.message}</p>}
                </div>
                <div className="form-row">
                    <input
                        {...register("dni", {
                            required: "DNI is mandatory",
                            pattern: { value: /^[0-9]+$/, message: "DNI must be a number" }
                        },)
                        }
                        placeholder="Legal id number" />
                    {errors.dni && <p style={{ color: "red" }}>{errors.dni?.message}</p>}
                </div>
                <div className="form-row">
                    <input
                        {...register("phone", {
                            required: "Phone number is mandatory",
                            pattern: { value: /^[0-9]+$/, message: "Phone number must be a number" },
                            minLength: { value: 10, message: "Phone number must be at least 10 digits" }
                        },)
                        }
                        placeholder="Phone number" />
                    {errors.phone && <p style={{ color: "red" }}>{errors.phone?.message}</p>}
                </div>
                {buttonDisabled === false && <button className="btn-primary" type="submit">Go to delivery</button>}
            </form>
        </div>
    );
}