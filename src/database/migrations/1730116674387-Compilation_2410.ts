import { MigrationInterface, QueryRunner } from "typeorm";
import { Service } from "typedi";

@Service()
export class Compilation24101730116674387 implements MigrationInterface {
    name = 'Compilation24101730116674387';

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Manual query begin
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
        // Manual query end

        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS transactional;`);
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS admin;`);
        await queryRunner.query(`CREATE ROLE pictaccio_transactional WITH LOGIN PASSWORD 'password';GRANT CONNECT ON DATABASE "pictaccio" TO pictaccio_transactional;`);
        await queryRunner.query(`CREATE TABLE "transactional"."workflows" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "options" jsonb NOT NULL, CONSTRAINT "workflows_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "workflows_internal_name_idx" ON "transactional"."workflows" ("internal_name") `);
        await queryRunner.query(`CREATE TYPE "admin"."users_status_enum" AS ENUM('ghost', 'invited', 'created', 'enabled', 'disabled', 'archived')`);
        await queryRunner.query(`CREATE TABLE "admin"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatar" text, "email" text NOT NULL, "hash" text, "info" jsonb NOT NULL, "last_login" TIMESTAMP, "rev" integer NOT NULL, "roles" jsonb NOT NULL, "salt" text, "seed" text, "status" "admin"."users_status_enum" NOT NULL DEFAULT 'ghost', "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "users_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."order_assignments" ("order_id" bigint NOT NULL, "user_id" uuid, CONSTRAINT "order_assignments_order_id_pkey" PRIMARY KEY ("order_id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."order_published_photos" ("id" SERIAL NOT NULL, "original" boolean NOT NULL, "original_path" text NOT NULL, "published" boolean NOT NULL, "version_path" text, "update_sent" boolean NOT NULL, "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "order_id" bigint, "subject_id" bigint, CONSTRAINT "order_published_photos_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "order_published_photos_original_path_idx" ON "admin"."order_published_photos" ("original_path") `);
        await queryRunner.query(`CREATE INDEX "order_published_photos_version_path_idx" ON "admin"."order_published_photos" ("version_path") `);
        await queryRunner.query(`CREATE TYPE "transactional"."delivery_options_method_enum" AS ENUM('fixed-rate', 'establishment', 'pick-up', 'canada-post')`);
        await queryRunner.query(`CREATE TABLE "transactional"."delivery_options" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "name_locale" jsonb NOT NULL, "base_price" numeric(10,2) NOT NULL, "lead_time" integer NOT NULL, "method" "transactional"."delivery_options_method_enum" NOT NULL, "options" jsonb, CONSTRAINT "UQ_72951c8e0b3fb8275dc0c500de8" UNIQUE ("internal_name"), CONSTRAINT "delivery_options_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "delivery_options_method_idx" ON "transactional"."delivery_options" ("method") `);
        await queryRunner.query(`CREATE TABLE "transactional"."delivery_option_groups" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, CONSTRAINT "delivery_option_groups_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "delivery_option_groups_internal_name_idx" ON "transactional"."delivery_option_groups" ("internal_name") `);
        await queryRunner.query(`CREATE TYPE "admin"."dangling_assets_type_enum" AS ENUM('background', 'product')`);
        await queryRunner.query(`CREATE TABLE "admin"."dangling_assets" ("id" BIGSERIAL NOT NULL, "path" text NOT NULL, "type" "admin"."dangling_assets_type_enum" NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "dangling_assets_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."tag_map" ("id" BIGSERIAL NOT NULL, "foreign_id" bigint NOT NULL, "tag_id" bigint, CONSTRAINT "tag_map_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "admin"."tags_scope_enum" AS ENUM('global', 'background', 'product')`);
        await queryRunner.query(`CREATE TABLE "admin"."tags" ("id" BIGSERIAL NOT NULL, "scope" "admin"."tags_scope_enum" NOT NULL DEFAULT 'global', "text" text NOT NULL, CONSTRAINT "tags_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "tags_scope_idx" ON "admin"."tags" ("scope") `);
        await queryRunner.query(`CREATE INDEX "tags_name_idx" ON "admin"."tags" ("text") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_categories" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "name_locale" jsonb NOT NULL, "priority" integer NOT NULL, CONSTRAINT "product_categories_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "product_categories_internal_name_idx" ON "transactional"."product_categories" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_custom_templates" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "options" jsonb NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "product_custom_templates_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "product_custom_templates_internal_name_idx" ON "transactional"."product_custom_templates" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_type_themes" ("id" BIGSERIAL NOT NULL, "default_theme" text, "themes_map" jsonb NOT NULL, "theme_set_id" bigint, CONSTRAINT "product_type_themes_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactional"."product_theme_sets" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "themes" jsonb NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "product_theme_sets_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "product_theme_sets_internal_name_idx" ON "transactional"."product_theme_sets" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_type_customs" ("id" BIGSERIAL NOT NULL, "custom_template_id" bigint, CONSTRAINT "product_type_customs_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "transactional"."products_type_enum" AS ENUM('touchup', 'digital', 'custom', 'themed', 'normal')`);
        await queryRunner.query(`CREATE TABLE "transactional"."products" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "name_locale" jsonb NOT NULL, "archived" boolean NOT NULL, "description_locale" jsonb NOT NULL, "images" jsonb NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', "price" numeric(10,2) NOT NULL, "priority" integer NOT NULL, "type" "transactional"."products_type_enum" NOT NULL DEFAULT 'normal', "weight" integer NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "modified_on" TIMESTAMP NOT NULL DEFAULT now(), "category_id" bigint, "theme_id" bigint, "custom_id" bigint, CONSTRAINT "REL_02f7c9972c12ee9a155bcb5377" UNIQUE ("theme_id"), CONSTRAINT "REL_c2ef038c5b16485c916206e661" UNIQUE ("custom_id"), CONSTRAINT "products_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "products_internal_name_idx" ON "transactional"."products" ("internal_name") `);
        await queryRunner.query(`CREATE INDEX "products_archived_idx" ON "transactional"."products" ("archived") `);
        await queryRunner.query(`CREATE INDEX "products_type_idx" ON "transactional"."products" ("type") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_catalog_ranks" ("id" BIGSERIAL NOT NULL, "rank" integer NOT NULL, "product_id" bigint NOT NULL, CONSTRAINT "product_catalog_ranks_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactional"."product_catalogs" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "name_locale" jsonb NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "product_catalogs_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "product_catalogs_internal_name_idx" ON "transactional"."product_catalogs" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_crosssells" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "options" jsonb NOT NULL, CONSTRAINT "product_crosssells_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "product_crosssells_internal_name_idx" ON "transactional"."product_crosssells" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."sessions" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "archived" boolean NOT NULL DEFAULT false, "options" jsonb NOT NULL, "expire_date" TIMESTAMP NOT NULL, "publish_date" TIMESTAMP NOT NULL, "product_crosssell_id" bigint, "workflow_id" bigint, CONSTRAINT "sessions_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "sessions_internal_name_idx" ON "transactional"."sessions" ("internal_name") `);
        await queryRunner.query(`CREATE INDEX "sessions_archived_idx" ON "transactional"."sessions" ("archived") `);
        await queryRunner.query(`CREATE INDEX "sessions_expire_date_idx" ON "transactional"."sessions" ("expire_date") `);
        await queryRunner.query(`CREATE INDEX "sessions_publish_date_idx" ON "transactional"."sessions" ("publish_date") `);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "transactional", "subjects", "GENERATED_COLUMN", "display_name", "COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')"]);
        await queryRunner.query(`CREATE TABLE "transactional"."subjects" ("id" BIGSERIAL NOT NULL, "code" text NOT NULL, "display_name" text GENERATED ALWAYS AS (COALESCE(NULLIF(COALESCE((info->>'firstName')::text, '') || CASE WHEN (info->>'firstName') IS NOT NULL AND (info->>'lastName') IS NOT NULL THEN ' ' ELSE '' END || COALESCE((info->>'lastName')::text, ''), ''), '--')) STORED NOT NULL, "group" text, "info" jsonb NOT NULL, "mappings" jsonb NOT NULL, "photos" jsonb NOT NULL, "search_name" text, "unique_id" text NOT NULL, "versions" jsonb, "session_id" bigint NOT NULL, CONSTRAINT "subjects_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "subjects_code_idx" ON "transactional"."subjects" ("code") `);
        await queryRunner.query(`CREATE INDEX "subjects_group_idx" ON "transactional"."subjects" ("group") `);
        await queryRunner.query(`CREATE INDEX "subjects_search_name_idx" ON "transactional"."subjects" ("search_name") `);
        await queryRunner.query(`CREATE INDEX "subjects_unique_id_idx" ON "transactional"."subjects" ("unique_id") `);
        await queryRunner.query(`CREATE TABLE "admin"."order_checks" ("id" SERIAL NOT NULL, "check" boolean NOT NULL, "photo_id" text NOT NULL, "product_id" text NOT NULL, "order_id" bigint, "subject_id" bigint, CONSTRAINT "order_checks_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."order_comments" ("id" SERIAL NOT NULL, "message" text NOT NULL, "edited" boolean NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "order_id" bigint, "user_id" uuid, CONSTRAINT "comments_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "admin"."order_statuses_status_enum" AS ENUM('pending', 'photo-processing', 'ready-to-print', 'printing-packaging', 'ready-to-ship', 'completed', 'correction-requested', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "admin"."order_statuses" ("id" SERIAL NOT NULL, "status" "admin"."order_statuses_status_enum" NOT NULL DEFAULT 'pending', "order_id" bigint, CONSTRAINT "REL_3ea5b2fdf48f16b209b65e7381" UNIQUE ("order_id"), CONSTRAINT "order_statuses_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "transactional", "contacts", "GENERATED_COLUMN", "name", "first_name || ' ' || last_name"]);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "transactional", "contacts", "GENERATED_COLUMN", "phone_digits", "regexp_replace(phone, '[^\\\\d]+', '', 'g')"]);
        await queryRunner.query(`CREATE TABLE "transactional"."contacts" ("id" BIGSERIAL NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "name" text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED NOT NULL, "email" text NOT NULL, "phone" text NOT NULL, "phone_digits" text GENERATED ALWAYS AS (regexp_replace(phone, '[^\\d]+', '', 'g')) STORED NOT NULL, "search_name" text, "street_address_1" text NOT NULL, "street_address_2" text, "postal_code" text NOT NULL, "city" text NOT NULL, "region" text NOT NULL, "country" text NOT NULL, "newsletter" boolean NOT NULL, CONSTRAINT "contacts_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "contacts_name_idx" ON "transactional"."contacts" ("name") `);
        await queryRunner.query(`CREATE INDEX "contacts_email_idx" ON "transactional"."contacts" ("email") `);
        await queryRunner.query(`CREATE INDEX "contacts_first_name_idx" ON "transactional"."contacts" ("phone_digits") `);
        await queryRunner.query(`CREATE INDEX "contacts_search_name_idx" ON "transactional"."contacts" ("search_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."subject_groups" ("id" BIGSERIAL NOT NULL, "group" text NOT NULL, "photos" jsonb NOT NULL, "versions" jsonb, "session_id" bigint, CONSTRAINT "subject_groups_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "subject_groups_group_idx" ON "transactional"."subject_groups" ("group") `);
        await queryRunner.query(`CREATE TABLE "transactional"."orders" ("id" BIGSERIAL NOT NULL, "archived" boolean NOT NULL DEFAULT false, "cart" jsonb NOT NULL, "comment" text NOT NULL, "flags" jsonb, "paid" boolean NOT NULL DEFAULT false, "photo_selection" jsonb NOT NULL, "sale_subtotal" numeric(10,2) NOT NULL, "sale_delivery_price" numeric(10,2), "sale_taxes" jsonb, "sale_total" numeric(10,2), "created_on" TIMESTAMP NOT NULL DEFAULT now(), "completed_on" TIMESTAMP NOT NULL DEFAULT now(), "contact_id" bigint, "delivery_option_id" bigint, "session_id" bigint, CONSTRAINT "orders_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "orders_archived_idx" ON "transactional"."orders" ("archived") `);
        await queryRunner.query(`CREATE INDEX "orders_paid_idx" ON "transactional"."orders" ("paid") `);
        await queryRunner.query(`CREATE INDEX "orders_created_on_idx" ON "transactional"."orders" ("created_on") `);
        await queryRunner.query(`CREATE INDEX "orders_completed_on_idx" ON "transactional"."orders" ("completed_on") `);
        await queryRunner.query(`CREATE TABLE "transactional"."transactions" ("id" BIGSERIAL NOT NULL, "payment_module" text NOT NULL, "successful" boolean NOT NULL, "transaction_code" text, "processor_response" jsonb NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "order_id" bigint, CONSTRAINT "transactions_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_code_campaigns" ("id" BIGSERIAL NOT NULL, "internal_name" text NOT NULL, "amount" numeric(10,2) NOT NULL, "code_prefix" text NOT NULL, "options" jsonb NOT NULL DEFAULT '{}', "created_on" TIMESTAMP NOT NULL DEFAULT now(), "modified_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "promo_code_campaigns_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "promo_code_campaigns_internal_name_idx" ON "transactional"."promo_code_campaigns" ("internal_name") `);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_codes" ("id" BIGSERIAL NOT NULL, "code" text NOT NULL, "used" boolean NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "used_on" TIMESTAMP NOT NULL DEFAULT now(), "campaign_id" bigint, "order_id" bigint, CONSTRAINT "REL_98dcaf14558d13f98e1892b023" UNIQUE ("order_id"), CONSTRAINT "promo_codes_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "promo_codes_code_idx" ON "transactional"."promo_codes" ("code") `);
        await queryRunner.query(`CREATE INDEX "promo_codes_used_idx" ON "transactional"."promo_codes" ("used") `);
        await queryRunner.query(`CREATE TABLE "transactional"."order_published_photos" ("id" BIGSERIAL NOT NULL, "images" jsonb NOT NULL, "order_id" bigint, "token" text NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "modified_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "order_published_photos_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "order_published_photos_token_idx" ON "transactional"."order_published_photos" ("token") `);
        await queryRunner.query(`CREATE TABLE "transactional"."background_categories" ("id" BIGSERIAL NOT NULL, "name_locale" jsonb NOT NULL, "priority" integer NOT NULL DEFAULT '0', CONSTRAINT "background_categories_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."app_integrations_app_enum" AS ENUM('canada-post', 'elavon', 'stripe', 'chase', 'paypal')`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "public", "app_integrations", "GENERATED_COLUMN", "active", "(configuration->>'active')::boolean"]);
        await queryRunner.query(`CREATE TABLE "app_integrations" ("app" "public"."app_integrations_app_enum" NOT NULL, "active" boolean GENERATED ALWAYS AS ((configuration->>'active')::boolean) STORED NOT NULL, "configuration" jsonb NOT NULL, CONSTRAINT "app_integrations_app_pkey" PRIMARY KEY ("app"))`);
        await queryRunner.query(`CREATE INDEX "app_integrations_active_idx" ON "app_integrations" ("active") `);
        await queryRunner.query(`CREATE TABLE "store_config" ("key" text NOT NULL, "value" text NOT NULL, CONSTRAINT "store_config_key_pkey" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "transactional"."backgrounds" ("id" BIGSERIAL NOT NULL, "name_locale" jsonb NOT NULL, "archived" boolean NOT NULL, "categories" jsonb NOT NULL, "featured" boolean NOT NULL, "image" text NOT NULL, "production_identifier" integer NOT NULL, CONSTRAINT "backgrounds_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "backgrounds_archived_idx" ON "transactional"."backgrounds" ("archived") `);
        await queryRunner.query(`CREATE INDEX "backgrounds_featured_idx" ON "transactional"."backgrounds" ("featured") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "backgrounds_production_identifier_key" ON "transactional"."backgrounds" ("production_identifier") `);
        await queryRunner.query(`CREATE TYPE "public"."app_states_key_enum" AS ENUM('lastBackgroundStatsOrderUpdateTimestamp', 'lastBackgroundStatsProcessedOrderId', 'lastSalesStatsOrderUpdateTimestamp', 'lastSalesStatsProcessedOrderId')`);
        await queryRunner.query(`CREATE TABLE "app_states" ("key" "public"."app_states_key_enum" NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "app_states_key_pkey" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "admin"."sales_stats" ("date" bigint NOT NULL, "order_id" bigint NOT NULL, "number_of_subjects" integer NOT NULL, "subtotal" numeric NOT NULL, "shipping" numeric NOT NULL, "promo_rebate" numeric NOT NULL, "taxes" numeric NOT NULL, "returns" numeric NOT NULL, "return_fees" numeric NOT NULL, "total" numeric NOT NULL, "session_id" bigint, CONSTRAINT "sales_stats_order_id_date_pkey" PRIMARY KEY ("date", "order_id"))`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "admin", "sales_stats_products", "GENERATED_COLUMN", "product_id", "\n        CASE \n            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint \n            ELSE NULL \n        END\n        "]);
        await queryRunner.query(`CREATE TABLE "admin"."sales_stats_products" ("sales_stats_date" bigint NOT NULL, "sales_stats_order_id" bigint NOT NULL, "sales_stats_product_id" text NOT NULL, "quantity" integer NOT NULL, "product_id" bigint GENERATED ALWAYS AS (
        CASE 
            WHEN sales_stats_product_id ~ '^[0-9]+$' THEN sales_stats_product_id::bigint 
            ELSE NULL 
        END
        ) STORED, CONSTRAINT "sales_stats_products_pkey" PRIMARY KEY ("sales_stats_date", "sales_stats_order_id", "sales_stats_product_id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."reset_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "email" text NOT NULL, "user_id" text NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "reset_requests_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "reset_requests_email_key" ON "admin"."reset_requests" ("email") `);
        await queryRunner.query(`CREATE INDEX "reset_requests_created_on_idx" ON "admin"."reset_requests" ("created_on") `);
        await queryRunner.query(`CREATE TABLE "admin"."user_invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "user_id" text NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "user_invites_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats" ("date" bigint NOT NULL, "background_id" bigint NOT NULL, "conversion_count" integer NOT NULL, "usage_count" integer NOT NULL, CONSTRAINT "background_stats_id_date_pkey" PRIMARY KEY ("date", "background_id"))`);
        await queryRunner.query(`INSERT INTO "public"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["pictaccio_db3093", "admin", "background_stats_products", "GENERATED_COLUMN", "product_id", "\n        CASE \n            WHEN background_stats_product_id ~ '^[0-9]+$' THEN background_stats_product_id::bigint \n            ELSE NULL \n        END\n        "]);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_products" ("background_stats_date" bigint NOT NULL, "background_stats_background_id" bigint NOT NULL, "background_stats_product_id" text NOT NULL, "product_id" bigint GENERATED ALWAYS AS (
        CASE 
            WHEN background_stats_product_id ~ '^[0-9]+$' THEN background_stats_product_id::bigint 
            ELSE NULL 
        END
        ) STORED, CONSTRAINT "background_stats_products_pkey" PRIMARY KEY ("background_stats_date", "background_stats_background_id", "background_stats_product_id"))`);
        await queryRunner.query(`CREATE TABLE "transactional"."delivery_option_groups_delivery_options_map" ("delivery_option_group_id" bigint NOT NULL, "delivery_option_id" bigint NOT NULL, CONSTRAINT "PK_ad13125eb074b77114fe4271ee4" PRIMARY KEY ("delivery_option_group_id", "delivery_option_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87bba13d85cde654dbe40156ce" ON "transactional"."delivery_option_groups_delivery_options_map" ("delivery_option_group_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a5c09c8c77976a30f560303a7c" ON "transactional"."delivery_option_groups_delivery_options_map" ("delivery_option_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_catalog_product_catalog_ranks_map" ("product_catalog_id" bigint NOT NULL, "product_catalog_rank_id" bigint NOT NULL, CONSTRAINT "PK_25b596236e7801e06a49dd21465" PRIMARY KEY ("product_catalog_id", "product_catalog_rank_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_31b622b667a9cbe0c08f4df443" ON "transactional"."product_catalog_product_catalog_ranks_map" ("product_catalog_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_725db83ede04e9167b86ec5aa7" ON "transactional"."product_catalog_product_catalog_ranks_map" ("product_catalog_rank_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_catalogs_products_map" ("product_catalog_id" bigint NOT NULL, "product_id" bigint NOT NULL, CONSTRAINT "PK_875873b981ed17aa58a3b50aed6" PRIMARY KEY ("product_catalog_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_425841fde14893607561d02d42" ON "transactional"."product_catalogs_products_map" ("product_catalog_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ab545eb2b4cebf1bd0c580f2f" ON "transactional"."product_catalogs_products_map" ("product_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."product_crosssells_products_map" ("product_crosssell_id" bigint NOT NULL, "product_id" bigint NOT NULL, CONSTRAINT "PK_48c6af92b8c45c9b917f09b8887" PRIMARY KEY ("product_crosssell_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf16abbf86c4f9dcaa7bee3615" ON "transactional"."product_crosssells_products_map" ("product_crosssell_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f728147c541f25b4012a4b8d9a" ON "transactional"."product_crosssells_products_map" ("product_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."sessions_delivery_option_groups_map" ("session_id" bigint NOT NULL, "delivery_option_group_id" bigint NOT NULL, CONSTRAINT "PK_a561800b66b478127e914ed67a4" PRIMARY KEY ("session_id", "delivery_option_group_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d3e57527080e1da3194fe56977" ON "transactional"."sessions_delivery_option_groups_map" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c6d2e25bd6ec7e28ea72a19bfe" ON "transactional"."sessions_delivery_option_groups_map" ("delivery_option_group_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."sessions_product_catalogs_map" ("session_id" bigint NOT NULL, "product_catalog_id" bigint NOT NULL, CONSTRAINT "PK_fc5303a064d801609ba4e996b12" PRIMARY KEY ("session_id", "product_catalog_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0be140681442e6f2a3e5b1b90" ON "transactional"."sessions_product_catalogs_map" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca9022b17aa0ac3fc611e26c7f" ON "transactional"."sessions_product_catalogs_map" ("product_catalog_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."orders_subject_groups_map" ("order_id" bigint NOT NULL, "subject_group_id" bigint NOT NULL, CONSTRAINT "PK_0f172561cd4ba68420d3724a5a8" PRIMARY KEY ("order_id", "subject_group_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e3753bb11e2e27b77368876cb7" ON "transactional"."orders_subject_groups_map" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_edd67ce806415e4acce76ce68b" ON "transactional"."orders_subject_groups_map" ("subject_group_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."orders_subjects_map" ("order_id" bigint NOT NULL, "subject_id" bigint NOT NULL, CONSTRAINT "PK_5fc621077ed0a0db649e6ee7518" PRIMARY KEY ("order_id", "subject_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_45ff980d78ba80eb02ff748e9d" ON "transactional"."orders_subjects_map" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e338c9a2a0cb98d5155d3a9522" ON "transactional"."orders_subjects_map" ("subject_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_code_campaigns_sessions_map" ("promo_code_campaign_id" bigint NOT NULL, "session_id" bigint NOT NULL, CONSTRAINT "PK_5ca46066200e1919ec0bfb1cb5e" PRIMARY KEY ("promo_code_campaign_id", "session_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aada62757a52b1bfadf69c0b03" ON "transactional"."promo_code_campaigns_sessions_map" ("promo_code_campaign_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_88f0255cb28afe33170f9290ab" ON "transactional"."promo_code_campaigns_sessions_map" ("session_id") `);
        await queryRunner.query(`CREATE TABLE "transactional"."promo_code_campaigns_workflows_map" ("promo_code_campaign_id" bigint NOT NULL, "workflow_id" bigint NOT NULL, CONSTRAINT "PK_40f47e0dbc651b2ebe4756eac8e" PRIMARY KEY ("promo_code_campaign_id", "workflow_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_842161317ba7f0203ea8b74fe5" ON "transactional"."promo_code_campaigns_workflows_map" ("promo_code_campaign_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_62ac493aa65618b57dce9ff53c" ON "transactional"."promo_code_campaigns_workflows_map" ("workflow_id") `);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_orders_map" ("date" bigint NOT NULL, "background_id" bigint NOT NULL, "order_id" bigint NOT NULL, CONSTRAINT "PK_14c2ad090670869c3dcb7581396" PRIMARY KEY ("date", "background_id", "order_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b956032439f36a323c52c7ff0" ON "admin"."background_stats_orders_map" ("date", "background_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_125d77ee34f2d7c2d8aac62553" ON "admin"."background_stats_orders_map" ("order_id") `);
        await queryRunner.query(`CREATE TABLE "admin"."background_stats_products_map" ("date" bigint NOT NULL, "background_id" bigint NOT NULL, "product_id" bigint NOT NULL, CONSTRAINT "PK_52f13ea9f23d8c735c5d874c675" PRIMARY KEY ("date", "background_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_86cfe1568ad848eca5fe01a614" ON "admin"."background_stats_products_map" ("date", "background_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_04fcb09fb8c262489c41410eb1" ON "admin"."background_stats_products_map" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "admin"."order_assignments" ADD CONSTRAINT "order_assignments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_assignments" ADD CONSTRAINT "order_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_published_photos" ADD CONSTRAINT "order_published_photo_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_published_photos" ADD CONSTRAINT "order_published_photo_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "transactional"."subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."tag_map" ADD CONSTRAINT "tag_map_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "admin"."tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_type_themes" ADD CONSTRAINT "product_type_themes_theme_set_id_fkey" FOREIGN KEY ("theme_set_id") REFERENCES "transactional"."product_theme_sets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_type_customs" ADD CONSTRAINT "product_type_custom_custom_template_id_fkey" FOREIGN KEY ("custom_template_id") REFERENCES "transactional"."product_custom_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "transactional"."product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD CONSTRAINT "product_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "transactional"."product_type_themes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" ADD CONSTRAINT "product_custom_id_fkey" FOREIGN KEY ("custom_id") REFERENCES "transactional"."product_type_customs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_product_crosssell_fkey" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" ADD CONSTRAINT "sessions_workflow_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" ADD CONSTRAINT "subject_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_checks" ADD CONSTRAINT "order_checks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_checks" ADD CONSTRAINT "order_checks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "transactional"."subjects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "comments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admin"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" ADD CONSTRAINT "order_statuses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."subject_groups" ADD CONSTRAINT "subject_group_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" ADD CONSTRAINT "order_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "transactional"."contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" ADD CONSTRAINT "order_delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" ADD CONSTRAINT "order_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."transactions" ADD CONSTRAINT "transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_codes" ADD CONSTRAINT "promo_code_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_codes" ADD CONSTRAINT "promo_code_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" ADD CONSTRAINT "sales_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products" ADD CONSTRAINT "background_stats_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" ADD CONSTRAINT "delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "transactional"."delivery_options"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" ADD CONSTRAINT "product_catalog_rank_id_fkey" FOREIGN KEY ("product_catalog_rank_id") REFERENCES "transactional"."product_catalog_ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" ADD CONSTRAINT "product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_crosssell_id_fkey" FOREIGN KEY ("product_crosssell_id") REFERENCES "transactional"."product_crosssells"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" ADD CONSTRAINT "product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "transactional"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" ADD CONSTRAINT "delivery_option_group_id_fkey" FOREIGN KEY ("delivery_option_group_id") REFERENCES "transactional"."delivery_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" ADD CONSTRAINT "product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "transactional"."product_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" ADD CONSTRAINT "subject_group_id_fkey" FOREIGN KEY ("subject_group_id") REFERENCES "transactional"."subject_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "transactional"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" ADD CONSTRAINT "subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "transactional"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "promo_code_campaign_id_fkey" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" ADD CONSTRAINT "session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "transactional"."sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "promo_code_campaign_id_fkey" FOREIGN KEY ("promo_code_campaign_id") REFERENCES "transactional"."promo_code_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" ADD CONSTRAINT "workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "transactional"."workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // Manual query begin
        await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON transactional.orders_subject_groups_map TO pictaccio_transactional;`);
        await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON transactional.orders_subjects_map TO pictaccio_transactional;`);
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
        await queryRunner.query(`SELECT create_hypertable('admin.background_stats', 'date')`);
        await queryRunner.query(`SELECT create_hypertable('admin.sales_stats', 'date')`);
        // Manual query end

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "workflow_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_workflows_map" DROP CONSTRAINT "promo_code_campaign_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_code_campaigns_sessions_map" DROP CONSTRAINT "promo_code_campaign_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "subject_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subjects_map" DROP CONSTRAINT "order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "subject_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders_subject_groups_map" DROP CONSTRAINT "order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_product_catalogs_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions_delivery_option_groups_map" DROP CONSTRAINT "session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_crosssells_products_map" DROP CONSTRAINT "product_crosssell_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalogs_products_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_rank_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_catalog_product_catalog_ranks_map" DROP CONSTRAINT "product_catalog_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."delivery_option_groups_delivery_options_map" DROP CONSTRAINT "delivery_option_group_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."background_stats_products" DROP CONSTRAINT "background_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."sales_stats_products" DROP CONSTRAINT "sales_stats_products_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_codes" DROP CONSTRAINT "promo_code_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."promo_codes" DROP CONSTRAINT "promo_code_campaign_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."transactions" DROP CONSTRAINT "transaction_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" DROP CONSTRAINT "order_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" DROP CONSTRAINT "order_delivery_option_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."orders" DROP CONSTRAINT "order_contact_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subject_groups" DROP CONSTRAINT "subject_group_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_statuses" DROP CONSTRAINT "order_statuses_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "comments_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_comments" DROP CONSTRAINT "comments_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_checks" DROP CONSTRAINT "order_checks_subject_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_checks" DROP CONSTRAINT "order_checks_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."subjects" DROP CONSTRAINT "subject_session_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_workflow_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."sessions" DROP CONSTRAINT "sessions_product_crosssell_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP CONSTRAINT "product_custom_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP CONSTRAINT "product_theme_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."products" DROP CONSTRAINT "product_category_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_type_customs" DROP CONSTRAINT "product_type_custom_custom_template_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transactional"."product_type_themes" DROP CONSTRAINT "product_type_themes_theme_set_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."tag_map" DROP CONSTRAINT "tag_map_tag_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_published_photos" DROP CONSTRAINT "order_published_photo_subject_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_published_photos" DROP CONSTRAINT "order_published_photo_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_assignments" DROP CONSTRAINT "order_assignments_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "admin"."order_assignments" DROP CONSTRAINT "order_assignments_order_id_fkey"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_04fcb09fb8c262489c41410eb1"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_86cfe1568ad848eca5fe01a614"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_products_map"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_125d77ee34f2d7c2d8aac62553"`);
        await queryRunner.query(`DROP INDEX "admin"."IDX_8b956032439f36a323c52c7ff0"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_orders_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_62ac493aa65618b57dce9ff53c"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_842161317ba7f0203ea8b74fe5"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_code_campaigns_workflows_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_88f0255cb28afe33170f9290ab"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_aada62757a52b1bfadf69c0b03"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_code_campaigns_sessions_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_e338c9a2a0cb98d5155d3a9522"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_45ff980d78ba80eb02ff748e9d"`);
        await queryRunner.query(`DROP TABLE "transactional"."orders_subjects_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_edd67ce806415e4acce76ce68b"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_e3753bb11e2e27b77368876cb7"`);
        await queryRunner.query(`DROP TABLE "transactional"."orders_subject_groups_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_ca9022b17aa0ac3fc611e26c7f"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_c0be140681442e6f2a3e5b1b90"`);
        await queryRunner.query(`DROP TABLE "transactional"."sessions_product_catalogs_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_c6d2e25bd6ec7e28ea72a19bfe"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_d3e57527080e1da3194fe56977"`);
        await queryRunner.query(`DROP TABLE "transactional"."sessions_delivery_option_groups_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_f728147c541f25b4012a4b8d9a"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_bf16abbf86c4f9dcaa7bee3615"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_crosssells_products_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_4ab545eb2b4cebf1bd0c580f2f"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_425841fde14893607561d02d42"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_catalogs_products_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_725db83ede04e9167b86ec5aa7"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_31b622b667a9cbe0c08f4df443"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_catalog_product_catalog_ranks_map"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_a5c09c8c77976a30f560303a7c"`);
        await queryRunner.query(`DROP INDEX "transactional"."IDX_87bba13d85cde654dbe40156ce"`);
        await queryRunner.query(`DROP TABLE "transactional"."delivery_option_groups_delivery_options_map"`);
        await queryRunner.query(`DROP TABLE "admin"."background_stats_products"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "product_id", "pictaccio_db3093", "admin", "background_stats_products"]);
        await queryRunner.query(`DROP TABLE "admin"."background_stats"`);
        await queryRunner.query(`DROP TABLE "admin"."user_invites"`);
        await queryRunner.query(`DROP INDEX "admin"."reset_requests_created_on_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."reset_requests_email_key"`);
        await queryRunner.query(`DROP TABLE "admin"."reset_requests"`);
        await queryRunner.query(`DROP TABLE "admin"."sales_stats_products"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "product_id", "pictaccio_db3093", "admin", "sales_stats_products"]);
        await queryRunner.query(`DROP TABLE "admin"."sales_stats"`);
        await queryRunner.query(`DROP TABLE "app_states"`);
        await queryRunner.query(`DROP TYPE "public"."app_states_key_enum"`);
        await queryRunner.query(`DROP INDEX "transactional"."backgrounds_production_identifier_key"`);
        await queryRunner.query(`DROP INDEX "transactional"."backgrounds_featured_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."backgrounds_archived_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."backgrounds"`);
        await queryRunner.query(`DROP TABLE "store_config"`);
        await queryRunner.query(`DROP INDEX "public"."app_integrations_active_idx"`);
        await queryRunner.query(`DROP TABLE "app_integrations"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "active", "pictaccio_db3093", "public", "app_integrations"]);
        await queryRunner.query(`DROP TYPE "public"."app_integrations_app_enum"`);
        await queryRunner.query(`DROP TABLE "transactional"."background_categories"`);
        await queryRunner.query(`DROP INDEX "transactional"."order_published_photos_token_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."order_published_photos"`);
        await queryRunner.query(`DROP INDEX "transactional"."promo_codes_used_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."promo_codes_code_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_codes"`);
        await queryRunner.query(`DROP INDEX "transactional"."promo_code_campaigns_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."promo_code_campaigns"`);
        await queryRunner.query(`DROP TABLE "transactional"."transactions"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_completed_on_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_created_on_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_paid_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."orders_archived_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."orders"`);
        await queryRunner.query(`DROP INDEX "transactional"."subject_groups_group_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."subject_groups"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_search_name_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_first_name_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_email_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."contacts_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."contacts"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "phone_digits", "pictaccio_db3093", "transactional", "contacts"]);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "name", "pictaccio_db3093", "transactional", "contacts"]);
        await queryRunner.query(`DROP TABLE "admin"."order_statuses"`);
        await queryRunner.query(`DROP TYPE "admin"."order_statuses_status_enum"`);
        await queryRunner.query(`DROP TABLE "admin"."order_comments"`);
        await queryRunner.query(`DROP TABLE "admin"."order_checks"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_unique_id_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_search_name_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_group_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."subjects_code_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."subjects"`);
        await queryRunner.query(`DELETE FROM "public"."typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN", "display_name", "pictaccio_db3093", "transactional", "subjects"]);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_publish_date_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_expire_date_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_archived_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."sessions_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."sessions"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_crosssells_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_crosssells"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_catalogs_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_catalogs"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_catalog_ranks"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_type_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_archived_idx"`);
        await queryRunner.query(`DROP INDEX "transactional"."products_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."products"`);
        await queryRunner.query(`DROP TYPE "transactional"."products_type_enum"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_type_customs"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_theme_sets_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_theme_sets"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_type_themes"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_custom_templates_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_custom_templates"`);
        await queryRunner.query(`DROP INDEX "transactional"."product_categories_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."product_categories"`);
        await queryRunner.query(`DROP INDEX "admin"."tags_name_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."tags_scope_idx"`);
        await queryRunner.query(`DROP TABLE "admin"."tags"`);
        await queryRunner.query(`DROP TYPE "admin"."tags_scope_enum"`);
        await queryRunner.query(`DROP TABLE "admin"."tag_map"`);
        await queryRunner.query(`DROP TABLE "admin"."dangling_assets"`);
        await queryRunner.query(`DROP TYPE "admin"."dangling_assets_type_enum"`);
        await queryRunner.query(`DROP INDEX "transactional"."delivery_option_groups_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."delivery_option_groups"`);
        await queryRunner.query(`DROP INDEX "transactional"."delivery_options_method_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."delivery_options"`);
        await queryRunner.query(`DROP TYPE "transactional"."delivery_options_method_enum"`);
        await queryRunner.query(`DROP INDEX "admin"."order_published_photos_version_path_idx"`);
        await queryRunner.query(`DROP INDEX "admin"."order_published_photos_original_path_idx"`);
        await queryRunner.query(`DROP TABLE "admin"."order_published_photos"`);
        await queryRunner.query(`DROP TABLE "admin"."order_assignments"`);
        await queryRunner.query(`DROP TABLE "admin"."users"`);
        await queryRunner.query(`DROP TYPE "admin"."users_status_enum"`);
        await queryRunner.query(`DROP INDEX "transactional"."workflows_internal_name_idx"`);
        await queryRunner.query(`DROP TABLE "transactional"."workflows"`);
    }

}
