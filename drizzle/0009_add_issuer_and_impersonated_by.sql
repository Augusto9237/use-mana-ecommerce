ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" text;
