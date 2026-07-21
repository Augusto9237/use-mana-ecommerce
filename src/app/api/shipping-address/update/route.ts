import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure address belongs to user
    const [existing] = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.id, id));

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updateData: any = {
      recipientName: data.recipientName,
      street: data.street,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood,
      zipCode: data.zipCode,
      country: data.country || existing.country,
      phone: data.phone,
      email: data.email,
      cpfOrCnpj: data.cpfOrCnpj,
    };

    const [updated] = await db
      .update(shippingAddressTable)
      .set(updateData)
      .where(eq(shippingAddressTable.id, id))
      .returning();

    revalidatePath("/addreses");

    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
