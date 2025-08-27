import { MigrationInterface, QueryRunner } from "typeorm";

export class SalesStats1727664861692 implements MigrationInterface {
    name = 'SalesStats1727664861692';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "admin"."background_stats_date_idx"`);
        await queryRunner.query(`CREATE TABLE "admin"."sales_stats_products" ("sales_stats_date" bigint NOT NULL, "sales_stats_order_id" bigint NOT NULL, "sales_stats_product_id" bigint NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "sales_stats_products_pkey" PRIMARY KEY ("sales_stats_date", "sales_stats_order_id", "sales_stats_product_id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."sales_stats" ("date" bigint NOT NULL, "order_id" bigint NOT NULL, "number_of_subjects" integer NOT NULL, "subtotal" numeric NOT NULL, "shipping" numeric NOT NULL, "promo_rebate" numeric NOT NULL, "taxes" numeric NOT NULL, "returns" numeric NOT NULL, "return_fees" numeric NOT NULL, "total" numeric NOT NULL, "session_id" bigint, CONSTRAINT "sales_stats_order_id_date_pkey" PRIMARY KEY ("date", "order_id"))`);
        // Next line custom
        await queryRunner.query(`SELECT create_hypertable('admin.sales_stats', 'date')`);
        await queryRunner.query(`DROP INDEX "public"."app_integrations_active_idx"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ADD "active" boolean GENERATED ALWAYS AS ((configuration->>'active')::boolean) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","public","app_integrations","GENERATED_COLUMN","active","(configuration->>'active')::boolean"]);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD "display_name" text GENERATED ALWAYS AS (COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","transactional","subjects","GENERATED_COLUMN","display_name","COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')"]);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_name_idx"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" ADD "name" text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","transactional","contacts","GENERATED_COLUMN","name","first_name || ' ' || last_name"]);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_first_name_idx"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" DROP COLUMN "phone_digits"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" ADD "phone_digits" text GENERATED ALWAYS AS (regexp_replace(phone, '[^\\d]+', '', 'g')) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db1","transactional","contacts","GENERATED_COLUMN","phone_digits","regexp_replace(phone, '[^\\\\d]+', '', 'g')"]);
        await queryRunner.query(`CREATE INDEX "app_integrations_active_idx" ON "app_integrations" ("active") `);
        await queryRunner.query(`CREATE INDEX "contacts_name_idx" ON "transactional"."contacts" ("name") `);
        await queryRunner.query(`CREATE INDEX "contacts_first_name_idx" ON "transactional"."contacts" ("phone_digits") `);
        //await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_date_fkey" FOREIGN KEY ("sales_stats_date", "sales_stats_order_id") REFERENCES "admin"."sales_stats"("date","order_id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`);
        //await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("sales_stats_product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_date_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_first_name_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_name_idx"`);
        await queryRunner.query(`DROP INDEX "public"."app_integrations_active_idx"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","phone_digits","pictaccio_db1","transactional","contacts"]);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" DROP COLUMN "phone_digits"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" ADD "phone_digits" text`);
        await queryRunner.query(`CREATE INDEX "contacts_first_name_idx" ON "transactional"."contacts" ("phone_digits") `);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","name","pictaccio_db1","transactional","contacts"]);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" ADD "name" text`);
        await queryRunner.query(`CREATE INDEX "contacts_name_idx" ON "transactional"."contacts" ("name") `);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","display_name","pictaccio_db1","transactional","subjects"]);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD "display_name" text`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","active","pictaccio_db1","public","app_integrations"]);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ADD "active" boolean`);
        await queryRunner.query(`CREATE INDEX "app_integrations_active_idx" ON "app_integrations" ("active") `);
        await queryRunner.query(`DROP TABLE "admin"."sales_stats"`);
        await queryRunner.query(`DROP TABLE "admin"."sales_stats_products"`);
        await queryRunner.query(`CREATE INDEX "background_stats_date_idx" ON "admin"."background_stats" ("date") `);
    }

}
