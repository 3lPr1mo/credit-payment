import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTotalColumnType1762627155185 implements MigrationInterface {
    name = 'AlterTotalColumnType1762627155185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD "total" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD "total" integer NOT NULL`);
    }

}
