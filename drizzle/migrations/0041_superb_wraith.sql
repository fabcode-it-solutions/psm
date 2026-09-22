ALTER TABLE "conversation_members" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "created_by" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "conversations_messages" ALTER COLUMN "sender_id" SET DATA TYPE integer;