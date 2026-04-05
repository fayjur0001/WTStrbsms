ALTER TABLE "users" ADD COLUMN "telegram" varchar;--> statement-breakpoint
CREATE INDEX "users_telegram_idx" ON "users" USING btree ("telegram");