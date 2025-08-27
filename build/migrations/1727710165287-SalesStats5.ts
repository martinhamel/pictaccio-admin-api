import { MigrationInterface, QueryRunner } from "typeorm";

export class SalesStats51727710165287 implements MigrationInterface {
    name = 'SalesStats51727710165287';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_8b956032439f36a323c52c7ff0"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "PK_14c2ad090670869c3dcb7581396"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "PK_c0bde8db9f65b33bc5d23a306f5" PRIMARY KEY ("background_id", "order_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD "date" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "PK_c0bde8db9f65b33bc5d23a306f5"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "PK_14c2ad090670869c3dcb7581396" PRIMARY KEY ("background_id", "order_id", "date")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_86cfe1568ad848eca5fe01a614"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "PK_d0c87a5f5afc99537b68f7e3041" PRIMARY KEY ("background_id", "product_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD "date" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "PK_d0c87a5f5afc99537b68f7e3041"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675" PRIMARY KEY ("background_id", "product_id", "date")`);
        await queryRunner.query(`CREATE INDEX "IDX_8b956032439f36a323c52c7ff0" ON "admin"."background_stats_orders_map" ("date", "background_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_86cfe1568ad848eca5fe01a614" ON "admin"."background_stats_products_map" ("date", "background_id") `);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_date_fkey" FOREIGN KEY ("sales_stats_date", "sales_stats_order_id") REFERENCES "admin"."sales_stats"("date","order_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id") REFERENCES "admin"."background_stats"("date","background_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id") REFERENCES "admin"."background_stats"("date","background_id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // Remove constraint to avoid violation bug:
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_date_fkey"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "background_stats_date_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_date_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_86cfe1568ad848eca5fe01a614"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_8b956032439f36a323c52c7ff0"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "PK_d0c87a5f5afc99537b68f7e3041" PRIMARY KEY ("background_id", "product_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD "date" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" DROP CONSTRAINT "PK_d0c87a5f5afc99537b68f7e3041"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675" PRIMARY KEY ("date", "background_id", "product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_86cfe1568ad848eca5fe01a614" ON "admin"."background_stats_products_map" ("date", "background_id") `);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id", "date", "background_id") REFERENCES "admin"."background_stats"("date","background_id","date","background_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "PK_14c2ad090670869c3dcb7581396"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "PK_c0bde8db9f65b33bc5d23a306f5" PRIMARY KEY ("background_id", "order_id")`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD "date" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" DROP CONSTRAINT "PK_c0bde8db9f65b33bc5d23a306f5"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "PK_14c2ad090670869c3dcb7581396" PRIMARY KEY ("date", "background_id", "order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_8b956032439f36a323c52c7ff0" ON "admin"."background_stats_orders_map" ("date", "background_id") `);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_orders_map" ADD CONSTRAINT "background_stats_date_fkey" FOREIGN KEY ("date", "background_id", "date", "background_id") REFERENCES "admin"."background_stats"("date","background_id","date","background_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
