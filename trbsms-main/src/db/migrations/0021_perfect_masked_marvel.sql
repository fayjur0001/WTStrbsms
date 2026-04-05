CREATE TYPE "public"."mdn_type" AS ENUM('one_time', 'long_term');--> statement-breakpoint
CREATE TABLE "mdn_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"from" varchar NOT NULL,
	"to" varchar NOT NULL,
	"reply" varchar NOT NULL,
	"pin" varchar,
	"type" "mdn_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
