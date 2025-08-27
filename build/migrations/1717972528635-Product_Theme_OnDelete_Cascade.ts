import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductThemeOnDeleteCascade1717972528635 implements MigrationInterface {
    name = 'ProductThemeOnDeleteCascade1717972528635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP CONSTRAINT "products_theme_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD CONSTRAINT "products_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "transactional"."product_type_themes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP CONSTRAINT "products_theme_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD CONSTRAINT "products_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "transactional"."product_type_themes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
