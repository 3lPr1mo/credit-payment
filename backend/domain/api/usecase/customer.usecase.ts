import { Customer } from "domain/model/customer.model";
import { CustomerServicePort } from "../customer.service.port";
import { CustomerPersistencePort } from "domain/spi/customer.persistence.port";
import { CustomerAlreadyExistsException } from "domain/exception/customer.already.exists.exception";
import { ExceptionConstant } from "domain/constant/exception.constants";

export class CustomerUseCase implements CustomerServicePort {

    constructor(private readonly customerPersistencePort: CustomerPersistencePort){}

    async createCustomer(customer: Customer): Promise<void> {
        const clientExists = await this.customerPersistencePort.clientExistsWithEmailAndDni(customer.email, customer.dni);
        if(clientExists){
            throw new CustomerAlreadyExistsException(ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE);
        }
        await this.customerPersistencePort.saveClient(customer);
    }
    
}