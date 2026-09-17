import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItemTable, cartTable, orderItemTable, orderTable, productTable, productVariantTable } from "@/db/schema";

async function clearCartForOrder(orderId: string) {
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    columns: { userId: true },
  });

  if (!order) {
    console.warn(`Order ${orderId} not found when clearing cart after payment.`);
    return;
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, order.userId),
    columns: { id: true },
  });

  if (!cart) {
    console.log(`No cart found for user ${order.userId} after payment confirmation.`);
    return;
  }

  await db.transaction(async (tx) => {
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
  });

  console.log(`Cart cleared for user ${order.userId} after payment confirmation of order ${orderId}.`);
}

async function decreaseStockForOrder(orderId: string) {
  const items = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    columns: { productVariantId: true, quantity: true },
    with: {
      productVariant: {
        columns: { sizeInStock: true },
      },
    },
  });

  await db.transaction(async (tx) => {
    for (const item of items) {
      let quantityToSubtract = item.quantity;
      const sizeInStock = item.productVariant.sizeInStock.map((stockItem) => {
        if (quantityToSubtract <= 0) return stockItem;

        const quantitySubtracted = Math.min(stockItem.stock, quantityToSubtract);
        quantityToSubtract -= quantitySubtracted;

        return {
          ...stockItem,
          stock: stockItem.stock - quantitySubtracted,
        };
      });

      await tx
        .update(productVariantTable)
        .set({ sizeInStock })
        .where(eq(productVariantTable.id, item.productVariantId));
    }
  });
}

export async function POST(req: Request) {
  try {
    // Log raw body for debugging
    const rawBody = await req.text();
    console.log("Mercado Pago webhook raw body:", rawBody);

    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse webhook body as JSON:", e);
      // Try to parse as query params (Mercado Pago sometimes sends as x-www-form-urlencoded)
      const params = new URLSearchParams(rawBody);
      body = {
        action: params.get("action"),
        type: params.get("type"),
        data: {
          id: params.get("data.id"),
        },
      };
    }

    // Extract event type and payment ID
    const eventType = body?.type || body?.action; // "payment", "plan", "subscription", etc.
    const paymentId = body?.data?.id;

    console.log(`Webhook event type: ${eventType}, Payment ID: ${paymentId}`);

    // If the webhook body already contains an external_reference (simulation or direct payload), use it first
    const directExternalReference =
      body?.external_reference || body?.payment?.external_reference || body?.data?.external_reference || null;

    if (directExternalReference && typeof directExternalReference === "string") {
      const m = directExternalReference.match(/^order-(.+)$/);
      if (m) {
        const orderId = m[1];
        try {
          await db
            .update(orderTable)
            .set({ status: "paid" })
            .where(eq(orderTable.id, orderId));
          await clearCartForOrder(orderId);
          console.log(`Order ${orderId} marked as paid (webhook via direct external_reference).`);
        } catch (e) {
          console.error("Failed to update order status from webhook (direct):", e);
        }
      }
    }

    // Only process payment events with paymentId by fetching details
    if (eventType === "payment" && paymentId) {
      // Fetch payment details from Mercado Pago to obtain `external_reference`
      try {
        const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!mpToken) {
          console.error("MERCADOPAGO_ACCESS_TOKEN not set — cannot fetch payment details.");
        } else {
          const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${mpToken}` },
          });
          if (!res.ok) {
            console.error(`Failed to fetch payment ${paymentId} from Mercado Pago:`, res.status);
          } else {
            const payment = await res.json();
            const externalReference = payment?.external_reference || null;
            if (externalReference && typeof externalReference === "string") {
              const orderId = externalReference;

              try {
                await db
                  .update(orderTable)
                  .set({ status: "paid", paymentId: payment?.id })
                  .where(eq(orderTable.id, orderId));

                await decreaseStockForOrder(orderId);
                await clearCartForOrder(orderId);
                console.log(`O pedido ${orderId} foi marcado como pago (webhook via fetch).`);
              } catch (e) {
                console.error("Failed to update order status from webhook:", e);
              }
            } else {
              console.warn("Payment has no external_reference:", paymentId);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching payment details from Mercado Pago:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to prevent Mercado Pago from retrying indefinitely
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}
