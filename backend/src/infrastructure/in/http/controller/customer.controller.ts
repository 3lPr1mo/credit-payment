import { Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CustomerHandler } from "application/handler/customer.handler";
import { CustomerExceptionHandler } from "../exceptionhandler/customer.exception.handler";
import { CreateCustomerRequest } from "application/dto/request/create.customer.request";

@ApiTags('customer')
@Controller('customer')
export class CustomerController {

    constructor(
        private readonly customerHandler: CustomerHandler,
        private readonly exceptionHandler: CustomerExceptionHandler
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary: 'Create a customer'})
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Customer created'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Customer already exists'
    })
    async creatCustomer(@Body() customerRequest: CreateCustomerRequest): Promise<void> {
        try{
            return await this.customerHandler.createCustomer(customerRequest);
        } catch(error) {
            this.exceptionHandler.handleCreateCustomer(error);
        }
    }

}