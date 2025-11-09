import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorTables1762624363486 implements MigrationInterface {
    name = 'RefactorTables1762624363486'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "UQ_9c6f739e14d08704a6305d7daa5" UNIQUE ("delivery_id")`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "UQ_9c6f739e14d08704a6305d7daa5"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP COLUMN "created_at"`);
    }

}
