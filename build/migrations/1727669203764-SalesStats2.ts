import { MigrationInterface, QueryRunner } from "typeorm";

export class SalesStats21727669203764 implements MigrationInterface {
    name = 'SalesStats21727669203764';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "admin"."sales_stats_date_idx"`);
        await queryRunner.query(`CREATE TYPE "admin"."sales_stats_products_product_type_enum" AS ENUM('touchup', 'digital', 'custom', 'themed', 'normal')`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD "product_type" "admin"."sales_stats_products_product_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."dangling_assets" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "admin"."dangling_assets_type_enum" AS ENUM('background', 'product')`);
        await queryRunner.query(`ALTER TABLE "admin"."dangling_assets" ADD "type" "admin"."dangling_assets_type_enum" NOT NULL`);
        await queryRunner.query(`DROP INDEX "admin"."tags_scope_idx"`);
        await queryRunner.query(`ALTER TABLE "admin"."tags" DROP COLUMN "scope"`);
        await queryRunner.query(`CREATE TYPE "admin"."tags_scope_enum" AS ENUM('global', 'background', 'product')`);
        await queryRunner.query(`ALTER TABLE "admin"."tags" ADD "scope" "admin"."tags_scope_enum" NOT NULL DEFAULT 'global'`);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP CONSTRAINT "app_integrations_app_pkey"`);

        await queryRunner.query(`ALTER TABLE "app_integrations" ADD "app_temp" VARCHAR`);
        await queryRunner.query(`UPDATE "app_integrations" SET "app_temp" = "app"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP COLUMN "app"`);
        await queryRunner.query(`CREATE TYPE "public"."app_integrations_app_enum" AS ENUM('canada-post', 'elavon', 'stripe', 'chase', 'paypal')`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ADD "app" "public"."app_integrations_app_enum"`);
        await queryRunner.query(`
            UPDATE "app_integrations" 
            SET "app" = CASE 
                WHEN "app_temp" = 'canada-post' THEN 'canada-post'::"public"."app_integrations_app_enum"
                WHEN "app_temp" = 'elavon' THEN 'elavon'::"public"."app_integrations_app_enum"
                WHEN "app_temp" = 'stripe' THEN 'stripe'::"public"."app_integrations_app_enum"
                WHEN "app_temp" = 'chase' THEN 'chase'::"public"."app_integrations_app_enum"
                WHEN "app_temp" = 'paypal' THEN 'paypal'::"public"."app_integrations_app_enum"
                ELSE NULL
            END
        `);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP COLUMN "app_temp"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ALTER COLUMN "app" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "app_integrations" ADD CONSTRAINT "app_integrations_app_pkey" PRIMARY KEY ("app")`);
        await queryRunner.query(`ALTER TABLE "admin"."users" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "admin"."users_status_enum" AS ENUM('ghost', 'invited', 'created', 'enabled', 'disabled', 'archived')`);
        await queryRunner.query(`ALTER TABLE "admin"."users" ADD "status" "admin"."users_status_enum" NOT NULL DEFAULT 'ghost'`);
        await queryRunner.query(`DROP INDEX "transactional"."delivery_options_method_idx"`);

        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" ADD "method_temp" VARCHAR`);
        await queryRunner.query(`UPDATE "transactional"."delivery_options" SET "method_temp" = "method"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" DROP COLUMN "method"`);
        await queryRunner.query(`CREATE TYPE "transactional"."delivery_options_method_enum" AS ENUM('fixed-rate', 'establishment', 'pick-up', 'canada-post')`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" ADD "method" "transactional"."delivery_options_method_enum"`);
        await queryRunner.query(`
            UPDATE "transactional"."delivery_options"
            SET "method" = CASE 
                WHEN "method_temp" = 'fixed-rate' THEN 'fixed-rate'::"transactional"."delivery_options_method_enum"
                WHEN "method_temp" = 'establishment' THEN 'establishment'::"transactional"."delivery_options_method_enum"
                WHEN "method_temp" = 'pick-up' THEN 'pick-up'::"transactional"."delivery_options_method_enum"
                WHEN "method_temp" = 'canada-post' THEN 'canada-post'::"transactional"."delivery_options_method_enum"
                ELSE NULL
            END
        `);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" DROP COLUMN "method_temp"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" ALTER COLUMN "method" SET NOT NULL`);

        await queryRunner.query(`DROP INDEX "transactional"."products_type_idx"`);

        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD "type_temp" VARCHAR`);
        await queryRunner.query(`UPDATE "transactional"."products" SET "type_temp" = "type"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "transactional"."products_type_enum" AS ENUM('touchup', 'digital', 'custom', 'themed', 'normal')`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD "type" "transactional"."products_type_enum" DEFAULT 'normal'`);
        await queryRunner.query(`
            UPDATE "transactional"."products"
            SET "type" = CASE 
                WHEN "type_temp" = 'touchup' THEN 'touchup'::"transactional"."products_type_enum"
                WHEN "type_temp" = 'digital' THEN 'digital'::"transactional"."products_type_enum"
                WHEN "type_temp" = 'custom' THEN 'custom'::"transactional"."products_type_enum"
                WHEN "type_temp" = 'themed' THEN 'themed'::"transactional"."products_type_enum"
                WHEN "type_temp" = 'normal' THEN 'normal'::"transactional"."products_type_enum"
                ELSE 'normal'::"transactional"."products_type_enum"
            END
        `);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP COLUMN "type_temp"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ALTER COLUMN "type" SET NOT NULL`);


        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" ADD "status_temp" VARCHAR`);
        await queryRunner.query(`UPDATE "admin"."order_statuses" SET "status_temp" = "status"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "admin"."order_statuses_status_enum" AS ENUM('pending', 'photo-processing', 'ready-to-print', 'printing-packaging', 'ready-to-ship', 'completed', 'correction-requested', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" ADD "status" "admin"."order_statuses_status_enum" DEFAULT 'pending'`);
        await queryRunner.query(`
            UPDATE "admin"."order_statuses"
            SET "status" = CASE 
                WHEN "status_temp" = 'pending' THEN 'pending'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'photo-processing' THEN 'photo-processing'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'ready-to-print' THEN 'ready-to-print'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'printing-packaging' THEN 'printing-packaging'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'ready-to-ship' THEN 'ready-to-ship'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'completed' THEN 'completed'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'correction-requested' THEN 'correction-requested'::"admin"."order_statuses_status_enum"
                WHEN "status_temp" = 'cancelled' THEN 'cancelled'::"admin"."order_statuses_status_enum"
                ELSE 'pending'::"admin"."order_statuses_status_enum"
            END
        `);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" DROP COLUMN "status_temp"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" ALTER COLUMN "status" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "app_states" DROP CONSTRAINT "app_states_key_pkey"`);

        await queryRunner.query(`ALTER TABLE "app_states" ADD "key_temp" VARCHAR`);
        await queryRunner.query(`UPDATE "app_states" SET "key_temp" = "key"`);
        await queryRunner.query(`ALTER TABLE "app_states" DROP COLUMN "key"`);
        await queryRunner.query(`CREATE TYPE "public"."app_states_key_enum" AS ENUM('lastBackgroundStatsOrderUpdateTimestamp', 'lastBackgroundStatsProcessedOrderId', 'lastSalesStatsOrderUpdateTimestamp', 'lastSalesStatsProcessedOrderId')`);
        await queryRunner.query(`ALTER TABLE "app_states" ADD "key" "public"."app_states_key_enum"`);
        await queryRunner.query(`
            UPDATE "app_states"
            SET "key" = CASE 
                WHEN "key_temp" = 'lastBackgroundStatsOrderUpdateTimestamp' THEN 'lastBackgroundStatsOrderUpdateTimestamp'::"public"."app_states_key_enum"
                WHEN "key_temp" = 'lastBackgroundStatsProcessedOrderId' THEN 'lastBackgroundStatsProcessedOrderId'::"public"."app_states_key_enum"
                WHEN "key_temp" = 'lastSalesStatsOrderUpdateTimestamp' THEN 'lastSalesStatsOrderUpdateTimestamp'::"public"."app_states_key_enum"
                WHEN "key_temp" = 'lastSalesStatsProcessedOrderId' THEN 'lastSalesStatsProcessedOrderId'::"public"."app_states_key_enum"
                ELSE NULL
            END
        `);
        await queryRunner.query(`ALTER TABLE "app_states" DROP COLUMN "key_temp"`);
        await queryRunner.query(`ALTER TABLE "app_states" ALTER COLUMN "key" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "app_states" ADD CONSTRAINT "app_states_key_pkey" PRIMARY KEY ("key")`);
        await queryRunner.query(`CREATE INDEX "tags_scope_idx" ON "admin"."tags" ("scope") `);
        await queryRunner.query(`CREATE INDEX "delivery_options_method_idx" ON "transactional"."delivery_options" ("method") `);
        await queryRunner.query(`CREATE INDEX "products_type_idx" ON "transactional"."products" ("type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "transactional"."products_type_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."delivery_options_method_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."tags_scope_idx"`);
        await queryRunner.query(`ALTER TABLE "app_states" DROP CONSTRAINT "app_states_key_pkey"`);
        await queryRunner.query(`ALTER TABLE "app_states" DROP COLUMN "key"`);
        await queryRunner.query(`DROP TYPE "public"."app_states_key_enum"`);
        await queryRunner.query(`ALTER TABLE "app_states" ADD "key" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_states" ADD CONSTRAINT "app_states_key_pkey" PRIMARY KEY ("key")`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "admin"."order_statuses_status_enum"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" ADD "status" text NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "transactional"."products_type_enum"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD "type" text NOT NULL DEFAULT 'normal'`);
        await queryRunner.query(`CREATE INDEX "products_type_idx" ON "transactional"."products" ("type") `);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" DROP COLUMN "method"`);
        await queryRunner.query(`DROP TYPE "transactional"."delivery_options_method_enum"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_options" ADD "method" text NOT NULL`);
        await queryRunner.query(`CREATE INDEX "delivery_options_method_idx" ON "transactional"."delivery_options" ("method") `);
        await queryRunner.query(`ALTER TABLE "admin"."users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "admin"."users_status_enum"`);
        await queryRunner.query(`ALTER TABLE "admin"."users" ADD "status" text NOT NULL DEFAULT 'ghost'`);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP CONSTRAINT "app_integrations_app_pkey"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" DROP COLUMN "app"`);
        await queryRunner.query(`DROP TYPE "public"."app_integrations_app_enum"`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ADD "app" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_integrations" ADD CONSTRAINT "app_integrations_app_pkey" PRIMARY KEY ("app")`);
        await queryRunner.query(`ALTER TABLE "admin"."tags" DROP COLUMN "scope"`);
        await queryRunner.query(`DROP TYPE "admin"."tags_scope_enum"`);
        await queryRunner.query(`ALTER TABLE "admin"."tags" ADD "scope" text NOT NULL DEFAULT 'global'`);
        await queryRunner.query(`CREATE INDEX "tags_scope_idx" ON "admin"."tags" ("scope") `);
        await queryRunner.query(`ALTER TABLE "admin"."dangling_assets" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "admin"."dangling_assets_type_enum"`);
        await queryRunner.query(`ALTER TABLE "admin"."dangling_assets" ADD "type" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP COLUMN "product_type"`);
        await queryRunner.query(`DROP TYPE "admin"."sales_stats_products_product_type_enum"`);
        await queryRunner.query(`CREATE INDEX "sales_stats_date_idx" ON "admin"."sales_stats" ("date") `);
    }

}
