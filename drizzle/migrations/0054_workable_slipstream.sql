CREATE TABLE "moderation_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"reason_label" varchar(255) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"flagged_by" varchar(255) NOT NULL,
	"flagged_by_user_id" integer,
	"flagged_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" varchar(255),
	"reviewed_by_user_id" integer,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "part_categories" DROP CONSTRAINT "part_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_flagged_by_user_id_users_id_fk" FOREIGN KEY ("flagged_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_part_idx" ON "moderation_queue" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "moderation_status_idx" ON "moderation_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "moderation_severity_idx" ON "moderation_queue" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "moderation_flagged_at_idx" ON "moderation_queue" USING btree ("flagged_at");--> statement-breakpoint
ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "is_active";