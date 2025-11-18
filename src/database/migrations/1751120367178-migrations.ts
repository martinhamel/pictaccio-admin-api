import { MigrationInterface, QueryRunner } from "typeorm";
import { Service } from "typedi";

@Service()
export class Migrations1751120367178 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatar" text, "email" text NOT NULL, "hash" text, "info" jsonb NOT NULL, "last_login" TIMESTAMP, "rev" integer NOT NULL, "roles" jsonb NOT NULL, "salt" text, "seed" text, "status" text NOT NULL DEFAULT 'ghost', "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "users_id_pkey" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "public"."users"`);
    }

}
