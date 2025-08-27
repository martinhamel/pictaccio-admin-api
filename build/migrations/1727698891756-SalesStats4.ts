import { MigrationInterface, QueryRunner } from "typeorm";

export class SalesStats41727698891756 implements MigrationInterface {
    name = 'SalesStats41727698891756';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "sales_stats_product_id"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "sales_stats_product_id" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "product_id" bigint GENERATED ALWAYS AS (
        CASE 
            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint 
            ELSE NULL 
        END
        ) STORED`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","admin","sales_stats_products","GENERATED_COLUMN","product_id","\n        CASE \n            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint \n            ELSE NULL \n        END\n        "]);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_pkey" PRIMARY KEY ("sales_stats_date", "sales_stats_order_id", "sales_stats_product_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_pkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_pkey" PRIMARY KEY ("sales_stats_date", "sales_stats_order_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "sales_stats_product_id"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "sales_stats_product_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_pkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_pkey" PRIMARY KEY ("sales_stats_date", "sales_stats_order_id", "sales_stats_product_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("sales_stats_product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","product_id","pictaccio_db1","admin","sales_stats_products"]);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "product_id"`);
    }

}
