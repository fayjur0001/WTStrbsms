CREATE TYPE "public"."currency" AS ENUM('BTC');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "added_funds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"txid" varchar,
	"amount" real NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"wallet_address" varchar NOT NULL,
	"currency" "currency" DEFAULT 'BTC' NOT NULL,
	"manualy_uploaded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "added_funds" ADD CONSTRAINT "added_funds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;