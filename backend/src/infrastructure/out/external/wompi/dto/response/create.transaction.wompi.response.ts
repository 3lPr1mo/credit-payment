export interface CreateTransactionWompiResponse {
    data: {
        id: string;
        created_at: string;
        amount_in_cents: number;
        status: string;
        reference: string;
        customer_email: string;
        currency: string;
        payment_method_type: string;
        payment_method: {
            type: string;
            phone_number: string;
        }
        shipping_address: {
            address_line_1: string;
            country: string;
            region: string;
            city: string;
            phone_number: string;
        }
    }
}