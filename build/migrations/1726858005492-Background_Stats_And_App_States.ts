import { MigrationInterface, QueryRunner } from "typeorm";

export class BackgroundStatsAndAppStates1726858005492 implements MigrationInterface {
    name = 'BackgroundStatsAndAppStates1726858005492';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Next line custom
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_crosssells_products_map_product_crosssell_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_crosssells_products_map_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "FK_88f0255cb28afe33170f9290ab7"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "FK_aada62757a52b1bfadf69c0b033"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "FK_62ac493aa65618b57dce9ff53c5"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "FK_842161317ba7f0203ea8b74fe57"`);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats" ("date" bigint NOT NULL, "background_id" bigint NOT NULL, "conversion_count" integer NOT NULL, "usage_count" integer NOT NULL, CONSTRAINT "background_stats_id_date_pkey" PRIMARY KEY ("date", "background_id"))`);
        // Next line custom
        await queryRunner.query(`SELECT create_hypertable('admin.background_stats', 'date')`);
        await queryRunner.query(`CREATE TABLE "app_states" ("key" text NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "app_states_key_pkey" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_orders_map" ("date" integer NOT NULL, "background_id" bigint NOT NULL, "order_id" bigint NOT NULL, CONSTRAINT "PK_14c2ad090670869c3dcb7581396" PRIMARY KEY ("date", "background_id", "order_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b956032439f36a323c52c7ff0" ON "admin"."background_stats_orders_map" ("date", "background_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_125d77ee34f2d7c2d8aac62553" ON "admin"."background_stats_orders_map" ("order_id") `);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_products_map" ("date" integer NOT NULL, "background_id" bigint NOT NULL, "product_id" bigint NOT NULL, CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675" PRIMARY KEY ("date", "background_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_86cfe1568ad848eca5fe01a614" ON "admin"."background_stats_products_map" ("date", "background_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_04fcb09fb8c262489c41410eb1" ON "admin"."background_stats_products_map" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" ADD CONSTRAINT "background_stats_background_id_fkey" FOREIGN KEY ("background_id") REFERENCES "transactional"."backgrounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_crosssell_id_fkey" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id") REFERENCES "admin"."background_stats"("date","background_id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id") REFERENCES "admin"."background_stats"("date","background_id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "promo_code_campaign_id_fkey" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "promo_code_campaign_id_fkey" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "workflow_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "promo_code_campaign_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "promo_code_campaign_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_crosssell_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats" DROP CONSTRAINT "background_stats_background_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" DROP DEFAULT`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_04fcb09fb8c262489c41410eb1"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_86cfe1568ad848eca5fe01a614"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_products_map"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_125d77ee34f2d7c2d8aac62553"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_8b956032439f36a323c52c7ff0"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_orders_map"`);
        await queryRunner.query(`DROP TABLE "app_states"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "FK_842161317ba7f0203ea8b74fe57" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "FK_62ac493aa65618b57dce9ff53c5" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "FK_aada62757a52b1bfadf69c0b033" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "FK_88f0255cb28afe33170f9290ab7" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_crosssells_products_map_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_crosssells_products_map_product_crosssell_id_fkey" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
