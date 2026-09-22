CREATE SEQUENCE "public"."list_hash_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 10 CYCLE;--> statement-breakpoint
ALTER TABLE "parts" ALTER COLUMN "partid" SET DEFAULT '#PRT' || LPAD(nextval('part_hash_id_seq')::text, 4, '0');--> statement-breakpoint
ALTER TABLE "parts" ALTER COLUMN "partid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "list_id" text DEFAULT '#LST' || LPAD(nextval('part_hash_id_seq')::text, 4, '0') NOT NULL;