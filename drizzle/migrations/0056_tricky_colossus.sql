CREATE TABLE "back_in_stock_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"variant_id" integer,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"notification_preferences" jsonb DEFAULT '{"email":true,"sms":false,"push":false}'::jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notified_at" timestamp,
	"expires_at" timestamp,
	"source" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_demand_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"wishlist_count" integer DEFAULT 0 NOT NULL,
	"notification_requests" integer DEFAULT 0 NOT NULL,
	"search_frequency" integer DEFAULT 0 NOT NULL,
	"cart_abandonment_count" integer DEFAULT 0 NOT NULL,
	"demand_score" integer DEFAULT 0 NOT NULL,
	"demand_level" varchar(20) DEFAULT 'low' NOT NULL,
	"last_in_stock_at" timestamp,
	"out_of_stock_duration_hours" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"user_id" integer,
	"session_id" varchar(255),
	"ip_address" varchar(50),
	"user_agent" text,
	"referrer" varchar(500),
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"view_duration_seconds" integer,
	"scrolled_percentage" integer,
	"clicked_add_to_cart" boolean DEFAULT false,
	"clicked_wishlist" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_demand_analytics" ADD CONSTRAINT "part_demand_analytics_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_views" ADD CONSTRAINT "part_views_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_views" ADD CONSTRAINT "part_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bis_part_id" ON "back_in_stock_requests" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "idx_bis_user_id" ON "back_in_stock_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bis_status" ON "back_in_stock_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bis_expires_at" ON "back_in_stock_requests" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "unique_user_part_request" ON "back_in_stock_requests" USING btree ("user_id","part_id","variant_id");--> statement-breakpoint
CREATE INDEX "idx_part_demand_part_id" ON "part_demand_analytics" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "idx_part_demand_score" ON "part_demand_analytics" USING btree ("demand_score");--> statement-breakpoint
CREATE INDEX "idx_part_demand_level" ON "part_demand_analytics" USING btree ("demand_level");--> statement-breakpoint
CREATE INDEX "unique_part_demand" ON "part_demand_analytics" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "idx_part_views_part_id" ON "part_views" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "idx_part_views_user_id" ON "part_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_part_views_viewed_at" ON "part_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "idx_part_views_session" ON "part_views" USING btree ("session_id");--> statement-breakpoint
CREATE VIEW "public"."high_demand_out_of_stock_parts" AS (select "parts"."id", "parts"."partid", "parts"."title", "parts"."slug", "parts"."status", "part_demand_analytics"."demand_score", "part_demand_analytics"."demand_level", "part_demand_analytics"."view_count", "part_demand_analytics"."wishlist_count", "part_demand_analytics"."notification_requests", "part_demand_analytics"."out_of_stock_duration_hours", 
        COALESCE(SUM("variants"."quantity"), 0)
       as "current_stock", 
        COUNT(DISTINCT "back_in_stock_requests"."id")
       as "pending_notifications", "part_demand_analytics"."last_in_stock_at", "part_demand_analytics"."updated_at" from "parts" left join "part_demand_analytics" on "parts"."id" = "part_demand_analytics"."part_id" left join "variants" on "variants"."part_id" = "parts"."id" left join "back_in_stock_requests" on "back_in_stock_requests"."part_id" = "parts"."id"
       AND "back_in_stock_requests"."status" = 'pending' where "parts"."status" = 'active' group by "parts"."id", "parts"."partid", "parts"."title", "parts"."slug", "parts"."status", "part_demand_analytics"."demand_score", "part_demand_analytics"."demand_level", "part_demand_analytics"."view_count", "part_demand_analytics"."wishlist_count", "part_demand_analytics"."notification_requests", "part_demand_analytics"."out_of_stock_duration_hours", "part_demand_analytics"."last_in_stock_at", "part_demand_analytics"."updated_at" having COALESCE(SUM("variants"."quantity"), 0) = 0 
        AND "part_demand_analytics"."demand_level" IN ('high', 'very_high') order by "part_demand_analytics"."demand_score" DESC);