CREATE TABLE "site_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_options_name_unique" UNIQUE("name")
);
