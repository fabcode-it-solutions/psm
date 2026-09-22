ALTER TABLE "user_social_media" RENAME COLUMN "type" TO "facebook";--> statement-breakpoint
ALTER TABLE "user_social_media" RENAME COLUMN "link" TO "instagram";--> statement-breakpoint
ALTER TABLE "user_social_media" DROP CONSTRAINT "uniq_user_type";--> statement-breakpoint
DROP INDEX "idx_user_social_media_type";--> statement-breakpoint
ALTER TABLE "user_social_media" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "user_social_media" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "user_social_media" ADD COLUMN "linkedIn" text;