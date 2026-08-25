ALTER TABLE "order" ADD COLUMN "payment_id" text;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_payment_id_unique" UNIQUE("payment_id");