CREATE TABLE "part_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"media_id" integer,
	"order" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "part_media" ADD CONSTRAINT "part_media_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_media" ADD CONSTRAINT "part_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "part_media_idx" ON "part_media" USING btree ("part_id","media_id");