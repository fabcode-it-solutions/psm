ALTER TABLE "parts" RENAME COLUMN "part_id" TO "partid";--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD COLUMN "bookmarked_user_id" integer;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_bookmarked_user_id_users_id_fk" FOREIGN KEY ("bookmarked_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;