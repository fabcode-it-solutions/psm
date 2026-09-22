CREATE TABLE "metafield_definition_categories" (
	"metafield_definition_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"is_required" boolean,
	"display_order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "metafield_definition_categories_metafield_definition_id_category_id_pk" PRIMARY KEY("metafield_definition_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "metafield_definitions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "metafield_definitions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "metafields" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "metafields" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "metafield_definitions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "metafield_definitions" ADD COLUMN "applies_globally" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "metafield_definition_categories" ADD CONSTRAINT "metafield_definition_categories_metafield_definition_id_metafield_definitions_id_fk" FOREIGN KEY ("metafield_definition_id") REFERENCES "public"."metafield_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metafield_definition_categories" ADD CONSTRAINT "metafield_definition_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "metafield_def_cat_metafield_idx" ON "metafield_definition_categories" USING btree ("metafield_definition_id");--> statement-breakpoint
CREATE INDEX "metafield_def_cat_category_idx" ON "metafield_definition_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "metafield_def_active_idx" ON "metafield_definitions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "metafield_def_global_idx" ON "metafield_definitions" USING btree ("applies_globally");--> statement-breakpoint
ALTER TABLE "metafields" ADD CONSTRAINT "metafield_unique" UNIQUE("entity_type","entity_id","metafield_definition_id");