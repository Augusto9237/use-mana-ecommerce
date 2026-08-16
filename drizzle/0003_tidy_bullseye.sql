CREATE TABLE "promotion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"link_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'product_variant' AND relkind = 'r') THEN
		ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "stock" integer DEFAULT 0 NOT NULL;
	END IF;
END$$;--> statement-breakpoint