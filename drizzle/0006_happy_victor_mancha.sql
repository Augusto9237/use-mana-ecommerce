ALTER TABLE "product_variant" ADD COLUMN IF NOT EXISTS "size_in_stock" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN IF EXISTS "size";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN IF EXISTS "stock";