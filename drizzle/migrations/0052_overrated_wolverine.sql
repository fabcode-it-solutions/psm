CREATE TABLE "admin_suspended_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"admin_id" integer,
	"reason" text,
	"suspend_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_suspended_user" ADD CONSTRAINT "admin_suspended_user_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_suspended_user" ADD CONSTRAINT "admin_suspended_user_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_suspended_user_user" ON "admin_suspended_user" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_admin_suspended_user_admin" ON "admin_suspended_user" USING btree ("admin_id");