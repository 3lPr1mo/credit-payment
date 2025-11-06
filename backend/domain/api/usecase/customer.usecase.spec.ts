import { Test, TestingModule } from "@nestjs/testing";
import { CustomerUseCase } from "./customer.usecase";
import { CustomerPersistencePort } from "domain/spi/customer.persistence.port";
import { Customer } from "domain/model/customer.model";
import { CustomerAlreadyExistsException } from "domain/exception/customer.already.exists.exception";
import { ExceptionConstant } from "domain/constant/exception.constants";

describe('CustomerUseCase', () => {
    let customerUseCase: CustomerUseCase;
    let customerPersistencePort: jest.Mocked<CustomerPersistencePort>;

    const mockCustomerPersistencePort: CustomerPersistencePort = {
        clientExistsWithEmailAndDni: jest.fn(),
        saveClient: jest.fn()
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: CustomerUseCase,
                    useFactory: () => new CustomerUseCase(mockCustomerPersistencePort)
                }
            ]
        }).compile();

        customerUseCase = module.get<CustomerUseCase>(CustomerUseCase);
        customerPersistencePort = mockCustomerPersistencePort as jest.Mocked<CustomerPersistencePort>;
    });

    describe('createCustomer', () => {
        it('should save customer when customer does not exist', async () => {
            const customer: Customer = {
                name: 'John',
                lastName: 'Doe',
                dni: '12345678',
                phone: '123456789',
                email: 'john.doe@example.com'
            };

            jest.spyOn(customerPersistencePort, 'clientExistsWithEmailAndDni').mockResolvedValue(false);
            jest.spyOn(customerPersistencePort, 'saveClient').mockResolvedValue();

            await customerUseCase.createCustomer(customer);

            expect(customerPersistencePort.clientExistsWithEmailAndDni).toHaveBeenCalledWith(customer.email, customer.dni);
            expect(customerPersistencePort.saveClient).toHaveBeenCalledWith(customer);
        });

        it('should throw CustomerAlreadyExistsException when customer already exists', async () => {
            const customer: Customer = {
                name: 'John',
                lastName: 'Doe',
                dni: '12345678',
                phone: '123456789',
                email: 'john.doe@example.com'
            };

            jest.spyOn(customerPersistencePort, 'clientExistsWithEmailAndDni').mockResolvedValue(true);

            await expect(customerUseCase.createCustomer(customer)).rejects.toThrow(CustomerAlreadyExistsException);
            await expect(customerUseCase.createCustomer(customer)).rejects.toThrow(ExceptionConstant.CUSTOMER_ALREADY_EXISTS_MESSAGE);
            expect(customerPersistencePort.saveClient).not.toHaveBeenCalled();
        });
    });
});

