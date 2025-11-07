import { BadRequestException, Logger } from "@nestjs/common";
import { CustomerAlreadyExistsException } from "domain/exception/customer.already.exists.exception";

export class CustomerExceptionHandler {
    handleCreateCustomer(error: Error): never {
        if(error instanceof CustomerAlreadyExistsException){
            throw new BadRequestException(error.message);
        }
        Logger.error('Unexpected error', error.stack, CustomerAlreadyExistsException.name);
        throw error;
    }
}