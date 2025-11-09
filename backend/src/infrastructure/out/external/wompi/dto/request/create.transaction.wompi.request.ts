export interface CreateTransactionWompiRequest {
    acceptance_token: string;
    acceptance_personal_auth: string;
    amount_in_cents: number;
    currency: string;
    signature: string;
    customer_email: string;
    reference: string;
    payment_method: PaymentMethodWompiRequest;
    customer_data: CustomerDataWompiRequest;
    shipping_address: ShippingAddressWompiRequest;
}

export interface PaymentMethodWompiRequest {
    type: string;
    token: string;
    installments: number;
}

export interface CustomerDataWompiRequest {
    phone_number: string;
    full_name: string;
    legal_id: string;
    legal_id_type: string;
}

export interface ShippingAddressWompiRequest {
    address_line_1: string;
    country: string;
    region: string;
    city: string;
    name: string;
    phone_number: string;
    postal_code: string;
}