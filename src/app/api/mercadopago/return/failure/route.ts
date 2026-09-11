import { deleteOrder } from "@/actions/delete-order";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

async function fetchOrder(orderId: string) {
  return db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: {
      user: {
        columns: {
          id: true,
        },
      },
    },
  });
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const url = new URL(req.url);
  const sp = url.searchParams;

  const externalReference = sp.get("external_reference");

  if (!externalReference) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  const order = await fetchOrder(externalReference);
  if (!order) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  if (order.userId !== session?.user?.id) {
    throw new CheckoutError("Não autorizado", 403);
  }

  // Exclui o pedido que não foi pago
  await deleteOrder(externalReference);

  // Redireciona de volta para o carrinho
  const clean = new URL("/checkout/failure", url.origin);
  return NextResponse.redirect(clean, 302);
}
