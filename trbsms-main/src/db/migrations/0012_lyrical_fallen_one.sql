CREATE TYPE "public"."one_time_rent_status" AS ENUM('Reserved', 'Awaiting MDN', 'Active', 'Expired', 'Rejected');--> statement-breakpoint
CREATE TABLE "one_time_rents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_id" text NOT NULL,
	"mdn" varchar NOT NULL,
	"service" varchar NOT NULL,
	"status" "one_time_rent_status" NOT NULL,
	"state" varchar NOT NULL,
	"price" real NOT NULL,
	"carrier" varchar NOT NULL,
	"till_expiration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "one_time_rents" ADD CONSTRAINT "one_time_rents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;