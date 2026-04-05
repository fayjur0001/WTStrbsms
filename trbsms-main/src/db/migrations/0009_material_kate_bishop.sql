CREATE TYPE "public"."ticket_status" AS ENUM('opened', 'closed');--> statement-breakpoint
CREATE TABLE "ticket_message_seen_bys" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "status" "ticket_status" DEFAULT 'opened' NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_message_seen_bys" ADD CONSTRAINT "ticket_message_seen_bys_message_id_ticket_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ticket_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_message_seen_bys" ADD CONSTRAINT "ticket_message_seen_bys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;