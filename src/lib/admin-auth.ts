import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function withAdminAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  if (session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return null;
}
