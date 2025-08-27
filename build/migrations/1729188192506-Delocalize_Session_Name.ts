import { MigrationInterface, QueryRunner } from "typeorm";

export class DelocalizeSessionName1729188192506 implements MigrationInterface {
    name = 'DelocalizeSessionName1729188192506';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Manual query begin
        // Transform column type from jsonb to text and rename it (for not empty tables)
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" RENAME COLUMN "name_locale" TO "internal_name"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ALTER COLUMN "internal_name" TYPE text USING("internal_name"::text)`);
        // Drop and recreate column with new type (for empty tables)
        // await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP COLUMN "name_locale"`);
        // await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD "internal_name" text NOT NULL`);
        // Manual query end
        await queryRunner.query(`CREATE UNIQUE INDEX "sessions_internal_name_idx" ON "transactional"."sessions" ("internal_name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "transactional"."sessions_internal_name_idx"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ALTER COLUMN "internal_name" TYPE jsonb USING("internal_name"::jsonb)`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" RENAME COLUMN "internal_name" TO "name_locale"`);
    }

}
