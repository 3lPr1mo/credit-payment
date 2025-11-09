import { Status } from "./enum/status.enum";

export interface TransactionStatus {
  id?: number;
  name: Status;
}