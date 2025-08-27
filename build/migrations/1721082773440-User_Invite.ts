import { MigrationInterface, QueryRunner } from "typeorm";

export class UserInvite1721082773440 implements MigrationInterface {
    name = 'UserInvite1721082773440';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_9bb41adf4431f6de42c79c4d305"`);
        await queryRunner.query(`CREATE TABLE "admin"."user_invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "user_id" text NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "user_invites_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "admin"."order_comments_id_seq" OWNED BY "admin"."order_comments"."id"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" SET DEFAULT nextval('"admin"."order_comments_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_ccfa14b4eafdd5fc9e63a544d90" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_e37473e95d368d6928b5b822579" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_e37473e95d368d6928b5b822579"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "FK_ccfa14b4eafdd5fc9e63a544d90"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" SET DEFAULT nextval('admin.comments_id_seq')`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "admin"."order_comments_id_seq"`);
        await queryRunner.query(`DROP TABLE "admin"."user_invites"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_9bb41adf4431f6de42c79c4d305" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
