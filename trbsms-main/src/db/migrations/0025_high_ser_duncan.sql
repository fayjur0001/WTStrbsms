CREATE TYPE "public"."rent_type" AS ENUM('short', 'regular', 'unlimited');--> statement-breakpoint
ALTER TABLE "long_term_rents" ADD COLUMN "rent_type" "rent_type" DEFAULT 'short' NOT NULL;