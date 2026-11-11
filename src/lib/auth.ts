import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins"

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "https://localhost:3000"]
      : []),
  ].filter((origin): origin is string => Boolean(origin)),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "userTable",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "accountTable",
  },
  verification: {
    modelName: "verificationTable",
  },
  plugins: [
    admin()
  ]
});
