CREATE TABLE "banned_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" text,
	"device_fingerprint" text,
	"reason" text,
	"banned_by" integer NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_blocks" ADD COLUMN "device_fingerprint" text;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "banned_devices" ADD CONSTRAINT "banned_devices_banned_by_users_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banned_devices_ip_address_idx" ON "banned_devices" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "banned_devices_device_fingerprint_idx" ON "banned_devices" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "user_blocks_ip_address_idx" ON "user_blocks" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "user_blocks_device_fingerprint_idx" ON "user_blocks" USING btree ("device_fingerprint");