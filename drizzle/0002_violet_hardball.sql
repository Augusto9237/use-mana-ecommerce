DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'category' AND relkind = 'r') THEN
		ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "image_url" text;
	END IF;
END$$;--> statement-breakpoint

DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'product_variant' AND relkind = 'r') THEN
		ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "size" text NOT NULL;
	END IF;
END$$;--> statement-breakpoint