import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionsTables1762572381284 implements MigrationInterface {
    name = 'TransactionsTables1762572381284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, "region" character varying NOT NULL, "postal_code" character varying NOT NULL, "destinataire_name" character varying NOT NULL, "fee" numeric(10,2), CONSTRAINT "PK_ffad7bf84e68716cd9af89003b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction_status" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_05fbbdf6bc1db819f47975c8c0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_gateway_transaction_id" character varying NOT NULL, "quantity" integer NOT NULL, "total" integer NOT NULL, "acceptance_end_user_policy" character varying NOT NULL, "acceptance_personal_data_authorization" character varying NOT NULL, "product_id" uuid, "delivery_id" uuid, "status_id" integer, "customer_id" uuid, CONSTRAINT "PK_d1c3a07f8a0cb7044b57cfe5f35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_f97c3092f8ece552bb601b8014d" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5" FOREIGN KEY ("delivery_id") REFERENCES "delivery"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_cbdca65eb713cd09c137c548e30" FOREIGN KEY ("status_id") REFERENCES "transaction_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_transaction" ADD CONSTRAINT "FK_ce127abecf2f10691dc709a2e1e" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_ce127abecf2f10691dc709a2e1e"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_cbdca65eb713cd09c137c548e30"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_9c6f739e14d08704a6305d7daa5"`);
        await queryRunner.query(`ALTER TABLE "order_transaction" DROP CONSTRAINT "FK_f97c3092f8ece552bb601b8014d"`);
        await queryRunner.query(`DROP TABLE "order_transaction"`);
        await queryRunner.query(`DROP TABLE "transaction_status"`);
        await queryRunner.query(`DROP TABLE "delivery"`);
    }

}
