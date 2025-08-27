import { MigrationInterface, QueryRunner } from "typeorm";

export class SubjectSessionIsNotNull1717952582217 implements MigrationInterface {
    name = 'SubjectSessionIsNotNull1717952582217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP CONSTRAINT "subjects_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ALTER COLUMN "session_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD CONSTRAINT "subjects_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP CONSTRAINT "subjects_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ALTER COLUMN "session_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD CONSTRAINT "subjects_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
