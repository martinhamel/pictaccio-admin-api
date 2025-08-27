import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactSearchName1726295822253 implements MigrationInterface {
    name = 'ContactSearchName1726295822253';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Manual query begin
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION transactional.update_contacts_search_name()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.search_name IS DISTINCT FROM public.unaccent(NEW.name::text) THEN
                    UPDATE transactional.contacts
                    SET search_name = public.unaccent(NEW.name::text)
                    WHERE id = NEW.id;
                END IF;
            
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
            CREATE TRIGGER trigger_update_contacts_search_name
            AFTER INSERT OR UPDATE ON "transactional"."contacts"
            FOR EACH ROW
            EXECUTE FUNCTION transactional.update_contacts_search_name();
        `);
        // Manual query end
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "FK_25f2533b728fa5307cf212076e6"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "FK_d0ca141e4a74512b14d2ced87b3"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_gro"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fk"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_catalogs_products_map_product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_catalogs_products_map_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fk"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "sessions_delivery_option_groups_map_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "sessions_product_catalogs_map_product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "sessions_product_catalogs_map_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "orders_subject_groups_map_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "orders_subject_groups_map_subject_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "orders_subjects_map_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "orders_subjects_map_subject_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_theme_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_product_crosssell_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_workflow_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" ADD "search_name" text`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "contacts_search_name_idx" ON "transactional"."contacts" ("search_name") `);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_product_crosssell_fkey" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_workflow_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_rank_id_fkey" FOREIGN KEY ("product_catalog_rank_id") REFERENCES "transactional"."product_catalog_ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "subject_group_id_fkey" FOREIGN KEY ("subject_group_id") REFERENCES "transactional"."subject_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "transactional"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        // Manual query begin
        await queryRunner.query(`UPDATE "transactional"."contacts" SET email = email;`);
        // Manual query end
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "subject_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "subject_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_rank_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_workflow_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_product_crosssell_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_search_name_idx"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns" ALTER COLUMN "options" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "transactional"."contacts" DROP COLUMN "search_name"`);
        await queryRunner.query(`CREATE INDEX "sessions_workflow_fkey" ON "transactional"."sessions" ("workflow_id") `);
        await queryRunner.query(`CREATE INDEX "sessions_product_crosssell_fkey" ON "transactional"."sessions" ("product_crosssell_id") `);
        await queryRunner.query(`CREATE INDEX "products_theme_id_fkey" ON "transactional"."products" ("theme_id") `);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "orders_subjects_map_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "transactional"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "orders_subjects_map_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "orders_subject_groups_map_subject_group_id_fkey" FOREIGN KEY ("subject_group_id") REFERENCES "transactional"."subject_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "orders_subject_groups_map_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "sessions_product_catalogs_map_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "sessions_product_catalogs_map_product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "sessions_delivery_option_groups_map_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "sessions_delivery_option_groups_map_delivery_option_group_id_fk" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_catalogs_products_map_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_catalogs_products_map_product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_rank_" FOREIGN KEY ("product_catalog_rank_id") REFERENCES "transactional"."product_catalog_ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_product_catalog_ranks_map_product_catalog_id_fk" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_id_" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_groups_delivery_options_map_delivery_option_gro" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "FK_d0ca141e4a74512b14d2ced87b3" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "FK_25f2533b728fa5307cf212076e6" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Manual query begin
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_contacts_search_name ON "transactional"."contacts";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS transactional.update_contacts_search_name;`);
        // Manual query end
    }

}
