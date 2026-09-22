ALTER TABLE "banned_devices" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "banned_devices" ADD CONSTRAINT "banned_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banned_devices_user_id_idx" ON "banned_devices" USING btree ("user_id");