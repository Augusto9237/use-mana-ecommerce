DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'product_variant' AND relkind = 'r') THEN
		BEGIN
			ALTER TABLE "product_variant" ALTER COLUMN "size" DROP NOT NULL;
		EXCEPTION WHEN undefined_column THEN NULL; END;
		ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "cost_in_cents" integer NOT NULL;
	END IF;
END$$;--> statement-breakpoint