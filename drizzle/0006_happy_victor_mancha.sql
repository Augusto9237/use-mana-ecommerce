ALTER TABLE "product_variant" ADD COLUMN "size_in_stock" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "size";--> statement-breakpoint
ALTER TABLE "product_variant" DROP COLUMN "stock";