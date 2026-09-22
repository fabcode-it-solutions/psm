ALTER TABLE "part_categories" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "part_categories" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "listed" varchar(50) DEFAULT 'For Sale';--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "brand_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "model_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "type_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_brand_id_car_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."car_brands"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_type_id_car_model_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."car_model_types"("id") ON DELETE cascade ON UPDATE cascade;