import { useForm } from "react-hook-form";
import type { CreditCard } from "../types/credit.card";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useState } from "react";
import "./styles/CreditCardModal.css";
import { useDispatch } from "react-redux";
import { setCard } from "../../../app/redux/slices/cardSlice";

interface Props {
    onClose: () => void,
    submit: () => void
}

export default function CreditCardModal({ onClose, submit }: Props) {

    const { register, handleSubmit, watch, formState: { errors } } = useForm<CreditCard>();
    const [focus, setFocus] = useState("");
    const [endPolicyAccepted, setEndPolicyAccepted] = useState(false);
    const [personalDataAccepted, setPersonalDataAccepted] = useState(false);

    const cardData = watch();
    const dispatch = useDispatch();

    const onSubmit = (data: CreditCard) => {
        dispatch(setCard(data));
        onClose();
        submit()
    }

    return (
        <div className="card-modal-overlay">
            <div className="card-modal-content">
                <h2>Card information</h2>
                <div className="card-modal-component">
                    <Cards
                        number={cardData.number}
                        name={cardData.cardHolder}
                        expiry={cardData.expMonth + "/" + cardData.expYear}
                        cvc={cardData.cvc}
                        focused={focus as any}
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <input
                            type="tel"
                            {...register("number", {
                                required: "Card number is mandatory",
                                pattern: { value: /^[0-9\s]{16}$/, message: "Invalid card number" },
                            },)
                            }
                            onFocus={() => setFocus("number")}
                            placeholder="Card number" />
                        {errors.number && <p style={{ color: "red" }}>{errors.number?.message}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            {...register("cardHolder", {
                                required: "Name on card is mandatory",
                            },)
                            }
                            onFocus={() => setFocus("name")}
                            placeholder="Name on card" />
                        {errors.cardHolder && <p style={{ color: "red" }}>{errors.cardHolder?.message}</p>}
                    </div>
                    <div className="card-modal-row">
                        <div>
                            <input
                                type="text"
                                {...register("expMonth", {
                                    required: "Expiration month is mandatory",
                                    pattern: { value: /^(0[1-9]|1[0-2])$/, message: "Invalid expiration month" },
                                },)
                                }
                                onFocus={() => setFocus("expiry")}
                                placeholder="MM" maxLength={2} />
                            {errors.expMonth && <p style={{ color: "red" }}>{errors.expMonth?.message}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                {...register("expYear", {
                                    required: "Expiration year is mandatory",
                                    pattern: { value: /^[2-9][4-9]$/, message: "Invalid expiration year" },
                                },)
                                }
                                onFocus={() => setFocus("expiry")}
                                placeholder="YY" maxLength={2} />
                            {errors.expYear && <p style={{ color: "red" }}>{errors.expYear?.message}</p>}
                        </div>
                        <div>
                            <input
                                type="tel"
                                {...register("cvc", {
                                    required: "CVC is mandatory",
                                    pattern: { value: /^[0-9]{3}$/, message: "Invalid CVC" },
                                },)
                                }
                                onFocus={() => setFocus("expiry")}
                                placeholder="CVC" />
                            {errors.cvc && <p style={{ color: "red" }}>{errors.cvc?.message}</p>}
                        </div>
                    </div>
                    <div className="card-modal-terms">
                        <label>
                            <input type="checkbox" checked={endPolicyAccepted} onChange={() => setEndPolicyAccepted(!endPolicyAccepted)}/>
                            I acknowledge that I have read the regulations and privacy policy for making this payment.
                        </label>
                        <label>
                            <input type="checkbox" checked={personalDataAccepted} onChange={() => setPersonalDataAccepted(!personalDataAccepted)}/>
                            I accept the authorization for the administration of personal data.
                        </label>
                    </div>
                    <div className="card-modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={!endPolicyAccepted || !personalDataAccepted}>Confirm</button>
                    </div>
                </form>
            </div>
        </div>
    );
}