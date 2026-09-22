CREATE TABLE "demand_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"notified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"notified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "part_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"user_id" integer,
	"session_id" varchar(255),
	"interaction_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "demand_notifications" ADD CONSTRAINT "demand_notifications_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_notifications" ADD CONSTRAINT "demand_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_interactions" ADD CONSTRAINT "part_interactions_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_interactions" ADD CONSTRAINT "part_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demand_notification_part_user_idx" ON "demand_notifications" USING btree ("part_id","user_id");--> statement-breakpoint
CREATE INDEX "demand_notification_part_idx" ON "demand_notifications" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "demand_notification_notified_idx" ON "demand_notifications" USING btree ("notified");--> statement-breakpoint
CREATE INDEX "part_interaction_part_idx" ON "part_interactions" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "part_interaction_type_idx" ON "part_interactions" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "part_interaction_date_idx" ON "part_interactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "part_interaction_user_idx" ON "part_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "part_interaction_session_idx" ON "part_interactions" USING btree ("session_id");