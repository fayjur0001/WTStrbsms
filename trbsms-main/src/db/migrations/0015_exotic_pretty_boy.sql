CREATE TYPE "public"."online_status" AS ENUM('awaiting mdn', 'online', 'offline');--> statement-breakpoint
ALTER TYPE "public"."one_time_rent_status" RENAME TO "rent_status";--> statement-breakpoint
CREATE TABLE "long_term_rents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_id" text NOT NULL,
	"mdn" varchar NOT NULL,
	"service" varchar NOT NULL,
	"status" "rent_status" NOT NULL,
	"price" real NOT NULL,
	"message" text,
	"pin" text,
	"expiration_date" timestamp NOT NULL,
	"onlineStatus" "online_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "long_term_rents" ADD CONSTRAINT "long_term_rents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;