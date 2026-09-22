ALTER TABLE "part_categories" DROP CONSTRAINT "part_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" DROP CONSTRAINT "parts_brand_id_car_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" DROP CONSTRAINT "parts_model_id_car_models_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" DROP CONSTRAINT "parts_type_id_car_model_types_id_fk";
--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "manufacturer_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "part_categories" ADD CONSTRAINT "part_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_brand_id_car_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."car_brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_type_id_car_model_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."car_model_types"("id") ON DELETE set null ON UPDATE no action;