ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;