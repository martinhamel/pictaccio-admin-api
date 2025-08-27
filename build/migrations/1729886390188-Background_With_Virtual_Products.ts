import { MigrationInterface, QueryRunner } from "typeorm";

export class BackgroundWithVirtualProducts1729886390188 implements MigrationInterface {
    name = 'BackgroundWithVirtualProducts1729886390188';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","admin","background_stats_products","GENERATED_COLUMN","product_id","\n        CASE \n            WHEN background_stats_product_id ~ '^[0-9]+$' THEN background_stats_product_id::bigint \n            ELSE NULL \n        END\n        "]);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_products" ("background_stats_date" bigint NOT NULL, "background_stats_background_id" bigint NOT NULL, "background_stats_product_id" text NOT NULL, "product_id" bigint GENERATED ALWAYS AS (
        CASE 
            WHEN background_stats_product_id ~ '^[0-9]+$' THEN background_stats_product_id::bigint 
            ELSE NULL 
        END
        ) STORED, CONSTRAINT "background_stats_products_pkey" PRIMARY KEY ("background_stats_date", "background_stats_background_id", "background_stats_product_id"))`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "product_id" bigint GENERATED ALWAYS AS (
        CASE 
            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint 
            ELSE NULL 
        END
        ) STORED`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","admin","sales_stats_products","GENERATED_COLUMN","product_id","\n        CASE \n            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint \n            ELSE NULL \n        END\n        "]);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products" ADD CONSTRAINT "background_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products" DROP CONSTRAINT "background_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products" DROP CONSTRAINT "background_stats_products_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" DROP CONSTRAINT "background_stats_id_date_pkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" ADD CONSTRAINT "background_stats_id_date_pkey" PRIMARY KEY ("background_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" ADD "date" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" DROP CONSTRAINT "background_stats_id_date_pkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" ADD CONSTRAINT "background_stats_id_date_pkey" PRIMARY KEY ("date", "background_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id") REFERENCES "admin"."background_stats"("date","background_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","product_id","pictaccio_db1","admin","sales_stats_products"]);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "product_id" bigint`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_products"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","product_id","pictaccio_db1","admin","background_stats_products"]);
    }

}
