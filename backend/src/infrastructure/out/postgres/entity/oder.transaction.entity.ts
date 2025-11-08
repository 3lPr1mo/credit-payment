import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { DeliveryEntity } from "./delivery.entity";
import { TransactionStatusEntity } from "./transaction.status.entity";
import { CustomerEntity } from "./customer.entity";

@Entity({ name: 'order_transaction' })
export class OrderTransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({name: 'payment_gateway_transaction_id'})
    paymentGatewayTransactionId?: string;

    @Column()
    quantity: number;

    @ManyToOne(() => ProductEntity, (product) => product.orderTransactions)
    @JoinColumn({name: 'product_id'})
    product: ProductEntity;

    @ManyToOne(() => DeliveryEntity, (delivery) => delivery.orderTransactions)
    @JoinColumn({name: 'delivery_id'})
    delivery: DeliveryEntity;

    @Column()
    total: number;

    @ManyToOne(() => TransactionStatusEntity, (status) => status.orderTransactions)
    @JoinColumn({name: 'status_id'})
    status: TransactionStatusEntity;

    @Column({name: 'acceptance_end_user_policy'})
    acceptanceEndUserPolicy: string;

    @Column({name: 'acceptance_personal_data_authorization'})
    acceptancePersonalDataAuthorization?: string;

    @ManyToOne(() => CustomerEntity, (customer) => customer.orderTransactions)
    @JoinColumn({name: 'customer_id'})
    customer: CustomerEntity;
}