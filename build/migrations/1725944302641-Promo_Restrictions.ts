import { MigrationInterface, QueryRunner } from "typeorm";

export class PromoRestrictions1725944302641 implements MigrationInterface {
    name = 'PromoRestrictions1725944302641';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_gro"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fk"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fk"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_type_customs_custom_template_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_custom_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_category_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_session_id_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."order_published_photos_subject_id_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."order_published_photos_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."subject_groups_session_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."transactions_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_session_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_delivery_option_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_contact_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."promo_codes_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."promo_codes_campaign_id_fkey"`);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_code_campaigns_sessions_map" ("promo_code_campaign_id" bigint NOT NULL, "session_id" bigint NOT NULL, CONSTRAINT "PK_5ca46066200e1919ec0bfb1cb5e" PRIMARY KEY ("promo_code_campaign_id", "session_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aada62757a52b1bfadf69c0b03" ON "transactional"."promo_code_campaigns_sessions_map" ("promo_code_campaign_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_88f0255cb28afe33170f9290ab" ON "transactional"."promo_code_campaigns_sessions_map" ("session_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_code_campaigns_workflows_map" ("promo_code_campaign_id" bigint NOT NULL, "workflow_id" bigint NOT NULL, CONSTRAINT "PK_40f47e0dbc651b2ebe4756eac8e" PRIMARY KEY ("promo_code_campaign_id", "workflow_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_842161317ba7f0203ea8b74fe5" ON "transactional"."promo_code_campaigns_workflows_map" ("promo_code_campaign_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_62ac493aa65618b57dce9ff53c" ON "transactional"."promo_code_campaigns_workflows_map" ("workflow_id") `);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_id_fkey" FOREIGN KEY ("product_catalog_rank_id") REFERENCES "transactional"."product_catalog_ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "FK_aada62757a52b1bfadf69c0b033" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "FK_88f0255cb28afe33170f9290ab7" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "FK_842161317ba7f0203ea8b74fe57" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "FK_62ac493aa65618b57dce9ff53c5" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "FK_62ac493aa65618b57dce9ff53c5"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "FK_842161317ba7f0203ea8b74fe57"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "FK_88f0255cb28afe33170f9290ab7"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "FK_aada62757a52b1bfadf69c0b033"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" DROP DEFAULT`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_62ac493aa65618b57dce9ff53c"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_842161317ba7f0203ea8b74fe5"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_code_campaigns_workflows_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_88f0255cb28afe33170f9290ab"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_aada62757a52b1bfadf69c0b03"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_code_campaigns_sessions_map"`);
        await queryRunner.query(`CREATE INDEX "promo_codes_campaign_id_fkey" ON "transactional"."promo_codes" ("campaign_id") `);
        await queryRunner.query(`CREATE INDEX "promo_codes_order_id_fkey" ON "transactional"."promo_codes" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "orders_contact_id_fkey" ON "transactional"."orders" ("contact_id") `);
        await queryRunner.query(`CREATE INDEX "orders_delivery_option_id_fkey" ON "transactional"."orders" ("delivery_option_id") `);
        await queryRunner.query(`CREATE INDEX "orders_session_id_fkey" ON "transactional"."orders" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "transactions_order_id_fkey" ON "transactional"."transactions" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "subject_groups_session_fkey" ON "transactional"."subject_groups" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "order_published_photos_order_id_fkey" ON "admin"."order_published_photos" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "order_published_photos_subject_id_fkey" ON "admin"."order_published_photos" ("subject_id") `);
        await queryRunner.query(`CREATE INDEX "subjects_session_id_fkey" ON "transactional"."subjects" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "products_category_id_fkey" ON "transactional"."products" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "products_custom_id_fkey" ON "transactional"."products" ("custom_id") `);
        await queryRunner.query(`CREATE INDEX "product_type_customs_custom_template_id_fkey" ON "transactional"."product_type_customs" ("custom_template_id") `);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fk" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_" FOREIGN KEY ("product_catalog_rank_id") REFERENCES "transactional"."product_catalog_ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fk" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_gro" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
