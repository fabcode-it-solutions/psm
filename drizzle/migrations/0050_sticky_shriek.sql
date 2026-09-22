ALTER TABLE "user_reports" ALTER COLUMN "report_id" SET DEFAULT '#RPT' || LPAD(nextval('report_hash_id_seq')::text, 4, '0');--> statement-breakpoint
ALTER TABLE "user_reports" ALTER COLUMN "report_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_reports" ALTER COLUMN "report_id" DROP EXPRESSION;