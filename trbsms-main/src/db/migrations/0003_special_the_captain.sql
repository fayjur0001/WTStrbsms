DROP INDEX "users_jabber_unique";--> statement-breakpoint
CREATE INDEX "users_jabber_idx" ON "users" USING btree ("jabber");