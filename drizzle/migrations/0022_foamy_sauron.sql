ALTER TABLE "variants" ADD COLUMN "option1" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "option2" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "option3" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "option1Label" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "option2Label" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "option3Label" varchar(255);--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN "cost_price";--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN "allow_backorder";--> statement-breakpoint
ALTER TABLE "variants" DROP COLUMN "option_values";