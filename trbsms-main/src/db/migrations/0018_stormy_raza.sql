CREATE TYPE "public"."proxy_type" AS ENUM('shared', 'exclusive');--> statement-breakpoint
CREATE TABLE "rented_proxies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_id" varchar NOT NULL,
	"port" varchar NOT NULL,
	"proxy_carrier" varchar NOT NULL,
	"proxy_user" varchar NOT NULL,
	"proxy_pass" varchar NOT NULL,
	"proxy_ip" varchar NOT NULL,
	"proxy_socks_port" integer NOT NULL,
	"proxy_http_port" integer NOT NULL,
	"price" real NOT NULL,
	"proxy_type" "proxy_type" NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rented_proxies" ADD CONSTRAINT "rented_proxies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;