ALTER TABLE "users" ADD COLUMN "last_login_ip" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_device" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;