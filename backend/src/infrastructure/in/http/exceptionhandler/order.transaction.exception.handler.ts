import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { ProductStockNotAvailableException } from "domain/exception/product.stock.not.available.exception";
import { TransactionAlreadyFinishedException } from "domain/exception/transaction.already.finished.exception";
import { TransactionNotFoundException } from "domain/exception/transaction.not.found.exception";

export class OrderTransactionExceptionHandler {
    handleStartTransaction(error: Error): never {
        if (error instanceof TransactionAlreadyFinishedException) {
            throw new BadRequestException(error.message);
        }
        if (error instanceof ProductStockNotAvailableException) {
            throw new BadRequestException(error.message);
        }
        if (error instanceof TransactionNotFoundException) {
            throw new NotFoundException(error.message);
        }
        Logger.error('Unexpected error', error.stack, OrderTransactionExceptionHandler.name);
        throw error;
    }
}