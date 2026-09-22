CREATE TABLE "user_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"blocker_user_id" integer NOT NULL,
	"blocked_user_id" integer NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_blocks_unique_block" UNIQUE("blocker_user_id","blocked_user_id")
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_user_id" integer NOT NULL,
	"reported_user_id" integer NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"category" text,
	"status" text DEFAULT 'pending',
	"admin_notes" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "wishlist_categories" RENAME COLUMN "image" TO "image_media_id";--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_user_id_users_id_fk" FOREIGN KEY ("blocker_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_user_id_users_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_blocks_blocker_user_id_idx" ON "user_blocks" USING btree ("blocker_user_id");--> statement-breakpoint
CREATE INDEX "user_blocks_blocked_user_id_idx" ON "user_blocks" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE INDEX "user_reports_reporter_user_id_idx" ON "user_reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "user_reports_reported_user_id_idx" ON "user_reports" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "user_reports_status_idx" ON "user_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_reports_category_idx" ON "user_reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_reports_reviewed_by_idx" ON "user_reports" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "user_reports_status_created_at_idx" ON "user_reports" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "wishlist_categories" ADD CONSTRAINT "wishlist_categories_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;