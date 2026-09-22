ALTER TABLE "car_brands" ALTER COLUMN "logo_media_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "car_brands" ALTER COLUMN "image_media_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "car_model_types" ALTER COLUMN "image_media_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "car_models" ALTER COLUMN "image_media_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "car_model_types" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "car_model_types" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "car_models" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "car_models" DROP COLUMN "updated_at";