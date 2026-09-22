ALTER TABLE "back_in_stock_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "part_demand_analytics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "part_views" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP VIEW "public"."high_demand_out_of_stock_parts";--> statement-breakpoint
DROP TABLE "back_in_stock_requests" CASCADE;--> statement-breakpoint
DROP TABLE "part_demand_analytics" CASCADE;--> statement-breakpoint
DROP TABLE "part_views" CASCADE;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "demand_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "wishlist_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "inquiry_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "last_restock_request" timestamp;--> statement-breakpoint
CREATE INDEX "part_demand_score_idx" ON "parts" USING btree ("demand_score");