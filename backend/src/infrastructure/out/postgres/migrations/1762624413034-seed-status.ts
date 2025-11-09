import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedStatus1762624413034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO transaction_status (id, name) VALUES (1, 'PENDING'), (2, 'APPROVED'), (3, 'DECLINED'), (4, 'VOIDED'), (5, 'ERROR')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM transaction_status WHERE id IN (1, 2, 3, 4, 5)`);
    }

}
