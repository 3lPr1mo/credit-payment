import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderTransactionEntity } from './oder.transaction.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  image?: string;

  @OneToMany(() => OrderTransactionEntity, (orderTransaction) => orderTransaction.product)
  orderTransactions?: OrderTransactionEntity[];
}
