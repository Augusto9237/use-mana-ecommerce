DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
		CREATE TYPE "public"."role" AS ENUM('user', 'admin');
	END IF;
END$$;--> statement-breakpoint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user' AND relkind = 'r') THEN
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" "role" DEFAULT 'user' NOT NULL;
    END IF;
END$$;--> statement-breakpoint