import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // verify ownership
    const deleted = await db
      .delete(shippingAddressTable)
      .where(eq(shippingAddressTable.id, id))
      .where(eq(shippingAddressTable.userId, session.user.id))
      .returning();

    revalidatePath("/addreses");

    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
