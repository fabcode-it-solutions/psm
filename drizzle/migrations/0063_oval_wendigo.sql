ALTER TABLE "user_activities" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "device_fingerprint" text;--> statement-breakpoint
ALTER TABLE "user_activities" ADD COLUMN "user_agent" text;--> statement-breakpoint
CREATE INDEX "user_activity_ip_address_idx" ON "user_activities" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "user_activity_device_fingerprint_idx" ON "user_activities" USING btree ("device_fingerprint");