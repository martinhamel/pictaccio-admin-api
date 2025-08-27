import { MigrationInterface, QueryRunner } from "typeorm";

export class SessionWorkflowNotNull1717948216965 implements MigrationInterface {
    name = 'SessionWorkflowNotNull1717948216965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_workflow_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ALTER COLUMN "workflow_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_workflow_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_workflow_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ALTER COLUMN "workflow_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_workflow_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
