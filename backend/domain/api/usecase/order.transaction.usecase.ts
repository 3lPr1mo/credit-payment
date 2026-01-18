import { OrderTransactionPersistencePort } from "domain/spi/order.transaction.persistence.port";
import { OrderTransactionServicePort } from "../order.transaction.service.port";
import { Card } from "domain/model/card.model";
import { OrderTransaction } from "domain/model/order.transaction.model";
import { ProductServicePort } from "../product.service.port";
import { CustomerServicePort } from "../customer.service.port";
import { DeliveryServicePort } from "../delivery.service.port";
import { Product } from "domain/model/product.model";
import { ExceptionConstant } from "domain/constant/exception.constants";
import { ProductStockNotAvailableException } from "domain/exception/product.stock.not.available.exception";
import { TransactionStatusPersistencePort } from "domain/spi/transaction.status.persistence.port";
import { Status } from "domain/model/enum/status.enum";
import { WompiServicePort } from "domain/spi/wompi.service.port";
import { AcceptanceType } from "domain/model/enum/acceptance.enum";
import { TransactionNotFoundException } from "domain/exception/transaction.not.found.exception";
import { TransactionAlreadyFinishedException } from "domain/exception/transaction.already.finished.exception";
import { log } from "console";
import { type } from "os";

const IVA: number = 0.19;

export class OrderTransactionUseCase implements OrderTransactionServicePort {
  constructor(
    private readonly orderTransactionPersistencePort: OrderTransactionPersistencePort,
    private readonly productServicePort: ProductServicePort,
    private readonly customerServicePort: CustomerServicePort,
    private readonly deliveryServicePort: DeliveryServicePort,
    private readonly transactionStatusPersistencePort: TransactionStatusPersistencePort,
    private readonly wompiServicePort: WompiServicePort
  ) {}


    async startTransaction(orderTransaction: OrderTransaction): Promise<OrderTransaction> {
        let customer = await this.customerServicePort.findCustomerByEmail(orderTransaction.customer.email);
        if(customer && Object.keys(customer).length === 0){
            customer = await this.customerServicePort.createCustomer(orderTransaction.customer);
        }
        orderTransaction.customer = customer;

        const product = await this.productServicePort.findProductById(orderTransaction.product.id);
        if(!this.productStockIsAvailable(product, orderTransaction.quantity)){
            throw new ProductStockNotAvailableException(ExceptionConstant.PRODUCT_STOCK_NOT_AVAILABLE_MESSAGE);
        }
        orderTransaction.product = product;

        orderTransaction.delivery.fee = this.calculateDeliveryFee();
        orderTransaction.delivery = await this.deliveryServicePort.createDelivery(orderTransaction.delivery);
        
        orderTransaction.total = this.calculateTotal(product, orderTransaction.quantity, orderTransaction.delivery.fee);
        orderTransaction.status = await this.transactionStatusPersistencePort.findTransactionStatusByName(Status.PENDING);

        const totalBeforeIva = orderTransaction.total;
        const ivaAmount = this.calculateIvaAmount(totalBeforeIva);

        orderTransaction.total = this.calculateTotalWithIva(orderTransaction.total);
        
        const acceptances = await this.wompiServicePort.getAcceptances();
        orderTransaction.acceptanceEndUserPolicy = acceptances.find(acceptance => acceptance.type === AcceptanceType.END_USER_POLICY);
        orderTransaction.acceptancePersonalDataAuthorization = acceptances.find(acceptance => acceptance.type === AcceptanceType.PERSONAL_DATA_AUTH);
        
        const transaction = await this.orderTransactionPersistencePort.saveOrderTransaction(orderTransaction);
        
        // Asignar el valor del IVA solo para la respuesta, no se persiste
        transaction.iva = ivaAmount;
        
        return transaction;
    }
    
    async findAllPendingTransactions(): Promise<OrderTransaction[]> {
        throw new Error("Method not implemented.");
    }
    
    async finishTransactionWithCard(id: string, card: Card): Promise<OrderTransaction> {
        const transaction = await this.orderTransactionPersistencePort.findTransactionById(id);
        if(!transaction){
            throw new TransactionNotFoundException(ExceptionConstant.TRANSACTION_NOT_FOUND_MESSAGE);
        }
        
        if(transaction.status.name !== Status.PENDING){
            throw new TransactionAlreadyFinishedException(ExceptionConstant.TRANSACTION_ALREADY_FINISHED_MESSAGE);
        }
        
        if(!this.productStockIsAvailable(transaction.product, transaction.quantity)){
            throw new ProductStockNotAvailableException(ExceptionConstant.PRODUCT_STOCK_NOT_AVAILABLE_MESSAGE);
        }

        const result = await this.wompiServicePort.pay(transaction, card);
        transaction.status = await this.transactionStatusPersistencePort.findTransactionStatusByName(result.data.status as Status);
        transaction.paymentGatewayTransactionId = result.data.id;

        if(result.data.status === Status.APPROVED){
            await this.productServicePort.updateProductStock(transaction.product.id, transaction.quantity);
        }
        
        // Calcular el valor del IVA antes de actualizar el total
        //const totalWithoutIva = transaction.total / (1 + IVA);
        const total = Number(transaction.total);
        const totalWithoutIva = Math.round(total / (1 + IVA));
        const ivaAmount = this.calculateIvaAmount(totalWithoutIva);
        
        transaction.total = this.calculateTotalWithIva(total);

        console.log('Total', transaction.total, typeof transaction.total);
        console.log('Transaction object before saving:', transaction);
        

        transaction.status = await this.transactionStatusPersistencePort.findTransactionStatusByName(result.data.status);
        
        const updatedTransaction = await this.orderTransactionPersistencePort.saveOrderTransaction(transaction);
        
        // Asignar el valor del IVA solo para la respuesta, no se persiste
        updatedTransaction.iva = ivaAmount;
        
        return updatedTransaction;
    }

    private productStockIsAvailable(product: Product, quantity: number): boolean {
        return product.stock >= quantity;
    }

    private calculateDeliveryFee(): number {
        return Math.floor((Math.random() * 10000) + 1);
    }

    private calculateTotal(product: Product, quantity: number, fee: number): number {
        return product.price * quantity + fee;
    }

    private calculateTotalWithIva(total: number): number {
        return Math.round(total * IVA + total);
        //return total * IVA + total;
    }

    private calculateIvaAmount(totalWithoutIva: number): number {
        return Math.round(totalWithoutIva * IVA);
        //return totalWithoutIva * IVA;
    }

    private roundToTwoDecimals(value: number): number {
        return Math.round(value * 100) / 100;
    }

}