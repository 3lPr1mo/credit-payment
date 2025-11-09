export class TransactionAlreadyFinishedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionAlreadyFinishedException';
  }
}