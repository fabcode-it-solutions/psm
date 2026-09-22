CREATE TABLE "manufacturers" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_media_id" integer,
	"description" varchar(255),
	"name" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"status" varchar(255) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_manufacturers_name" ON "manufacturers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_manufacturers_status" ON "manufacturers" USING btree ("status");