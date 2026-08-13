ALTER TABLE "product_variant" ALTER COLUMN "size" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "product_variant" ALTER COLUMN "image_url" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "shipping_fee_in_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "uber_quote_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "uber_delivery_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "uber_delivery_status" text;