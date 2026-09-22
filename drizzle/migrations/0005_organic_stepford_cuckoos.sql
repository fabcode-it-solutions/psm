ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "name" varchar(50);