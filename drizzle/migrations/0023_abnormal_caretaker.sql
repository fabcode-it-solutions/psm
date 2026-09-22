ALTER TABLE "users" ADD COLUMN "admin_blocked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "block_time" timestamp;