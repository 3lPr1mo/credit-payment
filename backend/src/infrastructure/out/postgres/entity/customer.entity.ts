import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderTransactionEntity } from './oder.transaction.entity';

@Entity({ name: 'customer' })
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  dni: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @OneToMany(() => OrderTransactionEntity, (orderTransaction) => orderTransaction.customer)
  orderTransactions?: OrderTransactionEntity[];
}
