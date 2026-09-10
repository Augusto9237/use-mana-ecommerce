// app/api/mp/return/route.ts
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { payment } from "@/lib/mercadopago";
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

    const paymentId = sp.get("payment_id");
    const externalReference = sp.get("external_reference");

    const order = await fetchOrder(externalReference!);
    if (!order) {
        throw new CheckoutError("Pedido não encontrado", 404);
    }

    if(order.userId !== session?.user?.id) {
        throw new CheckoutError("Não autorizado", 403);
    }
    const paymentStatus = await payment.get({ id: paymentId! });
    if (!paymentStatus) {
        throw new CheckoutError("Pagamento não encontrado", 404);
    }

    if (paymentStatus.status !== "approved") {
        throw new CheckoutError("Pagamento não aprovado", 400);
    }

    // Redireciona para uma página limpa (sem params)
    const clean = new URL("/checkout/success", url.origin);
    return NextResponse.redirect(clean, 302);
}