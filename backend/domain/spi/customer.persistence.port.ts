import { Customer } from "domain/model/customer.model";

export abstract class CustomerPersistencePort {
    abstract saveClient(customer: Customer): Promise<void>;
    abstract clientExistsWithEmailAndDni(email: string, dni: string): Promise<boolean>;
}