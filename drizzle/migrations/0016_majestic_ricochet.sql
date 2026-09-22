ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_part_id_parts_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_listing_id_listings_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_build_id_builds_id_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_build_id_builds_id_fk" FOREIGN KEY ("build_id") REFERENCES "public"."builds"("id") ON DELETE set null ON UPDATE no action;