import { MigrationInterface, QueryRunner } from "typeorm";

export class ObjectTags1724678315527 implements MigrationInterface {
    name = 'ObjectTags1724678315527';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin"."tag_map" ("id" BIGSERIAL NOT NULL, "foreign_id" bigint NOT NULL, "tag_id" bigint, CONSTRAINT "tag_map_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."tags" ("id" BIGSERIAL NOT NULL, "scope" text NOT NULL DEFAULT 'global', "text" text NOT NULL, CONSTRAINT "tags_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "tags_scope_idx" ON "admin"."tags" ("scope") `);
        await queryRunner.query(`CREATE INDEX "tags_name_idx" ON "admin"."tags" ("text") `);
        await queryRunner.query(`ALTER TABLE "admin"."tag_map" ADD CONSTRAINT "tag_map_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "admin"."tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."tag_map" DROP CONSTRAINT "tag_map_tag_id_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."tags_name_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."tags_scope_idx"`);
        await queryRunner.query(`DROP TABLE "admin"."tags"`);
        await queryRunner.query(`DROP TABLE "admin"."tag_map"`);
    }

}
