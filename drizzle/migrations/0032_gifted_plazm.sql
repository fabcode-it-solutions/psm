ALTER TABLE "wishlist_categories" ALTER COLUMN "is_public" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "default_address_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_address_id_addresses_id_fk" FOREIGN KEY ("default_address_id") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP COLUMN "is_private";