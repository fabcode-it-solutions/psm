CREATE TYPE "public"."moderation_status" AS ENUM('clean', 'flagged', 'reviewed', 'rejected', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."user_activity_type" AS ENUM('login', 'logout', 'block', 'unblock', 'password_change', 'profile_update', 'email_verify', 'suspend');--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"entity_type" "user_activity_type" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "moderation_queue" ALTER COLUMN "status" SET DEFAULT 'review';--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'clean';--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_activity_user_id_idx" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_entity_type_idx" ON "user_activities" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "user_activity_created_at_idx" ON "user_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "part_moderation_status_idx" ON "parts" USING btree ("moderation_status");