import { Customer } from "domain/model/customer.model";

export interface CustomerPersistencePort {
    saveClient(customer: Customer): Promise<void>;
    clientExistsWithEmailAndDni(email: string, dni: string): Promise<boolean>;
}