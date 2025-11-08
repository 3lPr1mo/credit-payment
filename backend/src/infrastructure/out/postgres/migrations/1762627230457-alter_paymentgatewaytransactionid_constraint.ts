import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterPaymentgatewaytransactionidConstraint1762627230457 implements MigrationInterface {
    name = 'AlterPaymentgatewaytransactionidConstraint1762627230457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" ALTER COLUMN "payment_gateway_transaction_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" ALTER COLUMN "payment_gateway_transaction_id" SET NOT NULL`);
    }

}
