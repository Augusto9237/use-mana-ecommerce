import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type UserWithRole = { role?: string };

export async function withAdminAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return null;
}
