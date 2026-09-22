ALTER TABLE "user_reports" ALTER COLUMN "status_record" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "part_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_reports" ADD COLUMN "report_id" text;