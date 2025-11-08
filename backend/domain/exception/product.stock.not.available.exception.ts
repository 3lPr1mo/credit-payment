export class ProductStockNotAvailableException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductStockNotAvailableException';
  }
}