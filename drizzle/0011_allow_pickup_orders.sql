ALTER TABLE "order" ALTER COLUMN "shipping_address_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "street" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "neighborhood" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "zipCode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "cpfOrCnpj" DROP NOT NULL;