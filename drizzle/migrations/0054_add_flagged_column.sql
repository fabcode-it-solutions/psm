-- Add flagged column to users table
ALTER TABLE "users" ADD COLUMN "flagged" boolean DEFAULT false NOT NULL;