ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_part_id_category_id_pk" PRIMARY KEY("part_id","category_id");--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "part_categories" DROP COLUMN "id";