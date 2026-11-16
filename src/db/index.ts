import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const rawUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL;

function createPool() {
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not defined");
  }

  let connectionString = rawUrl;
  try {
    const url = new URL(rawUrl);
    url.searchParams.delete("sslmode");
    connectionString = url.toString();
  } catch {
    connectionString = rawUrl.replace(/[?&]sslmode=[^&]+/, "");
  }

  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const pool = global.__dbPool || createPool();

if (process.env.NODE_ENV !== "production") {
  global.__dbPool = pool;
}

export const db = drizzle(pool, {
  schema,
});
