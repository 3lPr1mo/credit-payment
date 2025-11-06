import { Logger, NotFoundException } from "@nestjs/common";
import { ProductExceptionHandler } from "./product.exception.handler";
import { ProductNotFoundException } from "domain/exception/product.not.found.exception";
import { ExceptionConstant } from "domain/constant/exception.constants";

describe('ProductExceptionHandler', () => {
    let productExceptionHandler: ProductExceptionHandler;

    beforeEach(() => {
        productExceptionHandler = new ProductExceptionHandler();
        jest.spyOn(Logger, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleGetProducts', () => {
        it('should throw NotFoundException when error is ProductNotFoundException', () => {
            const error = new ProductNotFoundException(ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE);

            expect(() => productExceptionHandler.handleGetProducts(error)).toThrow(NotFoundException);
            expect(() => productExceptionHandler.handleGetProducts(error)).toThrow(ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE);
        });

        it('should not log error when error is ProductNotFoundException', () => {
            const error = new ProductNotFoundException(ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE);

            try {
                productExceptionHandler.handleGetProducts(error);
            } catch (e) {
                // Expected to throw
            }

            expect(Logger.error).not.toHaveBeenCalled();
        });

        it('should log error and throw original error when error is not ProductNotFoundException', () => {
            const error = new Error('Unexpected error');

            expect(() => productExceptionHandler.handleGetProducts(error)).toThrow(error);
            expect(Logger.error).toHaveBeenCalledTimes(1);
            expect(Logger.error).toHaveBeenCalledWith(
                'Unexpected error',
                error.stack,
                ProductExceptionHandler.name
            );
        });

        it('should preserve error message when converting ProductNotFoundException', () => {
            const customMessage = 'Custom not found message';
            const error = new ProductNotFoundException(customMessage);

            expect(() => productExceptionHandler.handleGetProducts(error)).toThrow(NotFoundException);
            expect(() => productExceptionHandler.handleGetProducts(error)).toThrow(customMessage);
        });
    });
});

