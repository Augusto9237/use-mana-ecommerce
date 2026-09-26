import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const url = new URL(req.url);
  const externalReference = url.searchParams.get("external_reference");

  if (!externalReference || !session?.user?.id) {
    return NextResponse.redirect(new URL(`${process.env.HOST_URL ?? "/"}/checkout/failure`));
  }

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, externalReference),
    columns: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.redirect(new URL(`${process.env.HOST_URL ?? "/"}/checkout/failure`));
  }

  return NextResponse.redirect(new URL(`${process.env.HOST_URL ?? "/"}/checkout/failure`));
}
