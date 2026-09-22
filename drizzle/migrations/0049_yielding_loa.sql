CREATE SEQUENCE "public"."part_hash_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 10 CYCLE;--> statement-breakpoint
CREATE SEQUENCE "public"."report_hash_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 10 CYCLE;--> statement-breakpoint
ALTER TABLE "user_reports" drop column "report_id";--> statement-breakpoint
ALTER TABLE "user_reports" ADD COLUMN "report_id" text GENERATED ALWAYS AS ('#RPT' || LPAD(id::text, 4, '0')) STORED;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "admin_blocked";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "block_time";