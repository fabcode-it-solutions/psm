ALTER TABLE "wishlist_categories" RENAME COLUMN "metadata" TO "seo_id";--> statement-breakpoint
ALTER TABLE "seo_meta" ALTER COLUMN "entity_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_categories" ADD CONSTRAINT "wishlist_categories_seo_id_seo_meta_id_fk" FOREIGN KEY ("seo_id") REFERENCES "public"."seo_meta"("id") ON DELETE set null ON UPDATE no action;