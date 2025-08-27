import { MigrationInterface, QueryRunner } from "typeorm";

export class SalesStats31727671019515 implements MigrationInterface {
    name = 'SalesStats31727671019515';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "product_type"`);
        await queryRunner.query(`DROP TYPE "admin"."sales_stats_products_product_type_enum"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ALTER COLUMN "sales_stats_product_id" TYPE varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "admin"."sales_stats_products_product_type_enum" AS ENUM('touchup', 'digital', 'custom', 'themed', 'normal')`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "product_type" "admin"."sales_stats_products_product_type_enum" NOT NULL`);
    }

}
