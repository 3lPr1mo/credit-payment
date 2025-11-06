import { MigrationInterface, QueryRunner } from "typeorm";

export class UuidExtension1762312289511 implements MigrationInterface {

    name = 'UuidExtension1762312289511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }

}
