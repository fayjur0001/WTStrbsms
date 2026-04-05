ALTER TABLE "users" ADD COLUMN "jabber" varchar;--> statement-breakpoint
CREATE INDEX "users_jabber_unique" ON "users" USING btree ("jabber");