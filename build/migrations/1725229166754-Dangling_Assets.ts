import { MigrationInterface, QueryRunner } from "typeorm";

export class DanglingAssets1725229166754 implements MigrationInterface {
    name = 'DanglingAssets1725229166754';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin"."dangling_assets" ("id" BIGSERIAL NOT NULL, "path" text NOT NULL, "type" text NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "dangling_assets_id_pkey" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin"."dangling_assets"`);
    }

}
