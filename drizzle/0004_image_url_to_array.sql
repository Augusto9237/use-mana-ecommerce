DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'product_variant' AND relkind = 'r') THEN
		BEGIN
			ALTER TABLE "product_variant" ALTER COLUMN "size" SET DATA TYPE text[] USING ARRAY["size"];
		EXCEPTION WHEN undefined_column THEN NULL; END;
		BEGIN
			ALTER TABLE "product_variant" ALTER COLUMN "image_url" SET DATA TYPE text[] USING ARRAY["image_url"];
		EXCEPTION WHEN undefined_column THEN NULL; END;
	END IF;
END$$;--> statement-breakpoint

DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'order' AND relkind = 'r') THEN
		ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "shipping_fee_in_cents" integer DEFAULT 0 NOT NULL;
		ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "uber_quote_id" text;
		ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "uber_delivery_id" text;
		ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "uber_delivery_status" text;
	END IF;
END$$;