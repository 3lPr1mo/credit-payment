import { Customer } from "domain/model/customer.model";

export abstract class CustomerServicePort {
    abstract createCustomer(customer: Customer): Promise<void>;
}