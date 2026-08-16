DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'product_variant' AND relkind = 'r') THEN
		ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "stock" integer NOT NULL DEFAULT 0;
	END IF;
END$$;
