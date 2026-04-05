CREATE TYPE "public"."payment_method" AS ENUM('blockonomics', 'now_payments');--> statement-breakpoint
ALTER TABLE "added_funds" ADD COLUMN "method" "payment_method" DEFAULT 'blockonomics' NOT NULL;