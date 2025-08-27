import { MigrationInterface, QueryRunner } from "typeorm";

export class SubjectDisplayAndSearchNames1723727161704 implements MigrationInterface {
    name = 'SubjectDisplayAndSearchNames1723727161704';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Manual query begin
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent;`);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION transactional.update_subjects_search_name()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.search_name IS DISTINCT FROM public.unaccent(NEW.display_name::text) THEN
                    UPDATE transactional.subjects
                    SET search_name = public.unaccent(NEW.display_name::text)
                    WHERE id = NEW.id;
                END IF;
            
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
            CREATE TRIGGER trigger_update_subjects_search_name
            AFTER INSERT OR UPDATE ON "transactional"."subjects"
            FOR EACH ROW
            EXECUTE FUNCTION transactional.update_subjects_search_name();
        `);
        // Manual query end
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_ccfa14b4eafdd5fc9e63a544d90"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_e37473e95d368d6928b5b822579"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_display_name_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."comments_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."comments_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD "search_name" text`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP COLUMN "display_name"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","display_name","pictaccio","transactional","subjects"]);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD "display_name" text GENERATED ALWAYS AS (COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio","transactional","subjects","GENERATED_COLUMN","display_name","COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')"]);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "admin"."order_comments_id_seq" OWNED BY "admin"."order_comments"."id"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" SET DEFAULT nextval('"admin"."order_comments_id_seq"')`);
        await queryRunner.query(`CREATE INDEX "subjects_search_name_idx" ON "transactional"."subjects" ("search_name") `);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "comments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Manual query begin
        await queryRunner.query(`UPDATE "transactional"."subjects" SET code = code;`);
        // Manual query end
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "comments_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "comments_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_search_name_idx"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "admin"."order_comments_id_seq"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","display_name","pictaccio","transactional","subjects"]);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP COLUMN "display_name"`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio","transactional","subjects","GENERATED_COLUMN","display_name","(info->>'firstName')::text || ' ' || (info->>'lastName')::text"]);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD "display_name" text GENERATED ALWAYS AS ((info->>'firstName')::text || ' ' || (info->>'lastName')::text) STORED NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP COLUMN "search_name"`);
        await queryRunner.query(`CREATE INDEX "comments_user_id_fkey" ON "admin"."order_comments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "comments_order_id_fkey" ON "admin"."order_comments" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "subjects_display_name_idx" ON "transactional"."subjects" ("display_name") `);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_e37473e95d368d6928b5b822579" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_ccfa14b4eafdd5fc9e63a544d90" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Manual query begin
        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_subjects_search_name ON "transactional"."subjects";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS transactional.update_subjects_search_name;`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent;`);
        // Manual query end
    }

}
