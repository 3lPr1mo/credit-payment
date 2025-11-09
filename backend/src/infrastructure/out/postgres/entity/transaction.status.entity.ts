import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
import { OrderTransactionEntity } from "./oder.transaction.entity";

@Entity({ name: 'transaction_status' })
export class TransactionStatusEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @OneToMany(() => OrderTransactionEntity, (orderTransaction) => orderTransaction.status)
    orderTransactions?: OrderTransactionEntity[];
}