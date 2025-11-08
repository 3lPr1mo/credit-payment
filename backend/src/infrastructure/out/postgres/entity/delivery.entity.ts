import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderTransactionEntity } from "./oder.transaction.entity";

@Entity({ name: 'delivery' })
export class DeliveryEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column()
    address: string;

    @Column()
    country: string

    @Column()
    city: string;

    @Column()
    region: string;

    @Column({name: 'postal_code'})
    postalCode: string;

    @Column({name: 'destinataire_name'})
    destinataireName: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    fee?: number;

    @OneToMany(() => OrderTransactionEntity, (orderTransaction) => orderTransaction.delivery)
    orderTransactions?: OrderTransactionEntity[];
}