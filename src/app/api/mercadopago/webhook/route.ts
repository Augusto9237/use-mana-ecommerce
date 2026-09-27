import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItemTable, cartTable, orderItemTable, orderTable, productVariantTable } from "@/db/schema";

function isValidWebhookSignature(
  dataId: string | null,
  requestId: string | null,
  signature: string | null,
): { valid: boolean; reason?: string } {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    return { valid: false, reason: "missing_secret" };
  }
  if (!signature) {
    return { valid: false, reason: "missing_signature_header" };
  }

  const signatureParts = new Map(
    signature.split(",").map((part) => {
      const [key, value] = part.trim().split("=", 2);
      return [key, value];
    }),
  );
  const timestamp = signatureParts.get("ts");
  const receivedSignature = signatureParts.get("v1");

  if (!timestamp || !receivedSignature || !/^[a-f\d]{64}$/i.test(receivedSignature)) {
    return { valid: false, reason: "malformed_signature_header" };
  }

  const manifestParts = [
    dataId ? `id:${dataId.toLowerCase()}` : null,
    requestId ? `request-id:${requestId}` : null,
    `ts:${timestamp}`,
  ].filter(Boolean);
  const manifest = `${manifestParts.join(";")};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest, "utf8")
    .digest("hex");

  try {
    const valid = crypto.timingSafeEqual(
        Buffer.from(receivedSignature, "hex"),
        Buffer.from(expected, "hex"),
      );
    return valid ? { valid: true } : { valid: false, reason: "signature_mismatch" };
  } catch {
    return { valid: false, reason: "malformed_signature_header" };
  }
}

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

async function markOrderAsPaid(orderId: string, paymentId: number | string) {
  const existingOrder = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    columns: {
      id: true,
      status: true,
      totalPriceInCents: true,
      paymentId: true,
    },
  });

  if (!existingOrder) {
    console.warn(`Cannot mark order ${orderId} as paid: order not found.`);
    return false;
  }

  if (existingOrder.status === "paid") {
    console.log(`Order ${orderId} already marked as paid; skipping duplicate processing.`);
    return true;
  }

  await db
    .update(orderTable)
    .set({ status: "paid", paymentId: String(paymentId) })
    .where(eq(orderTable.id, orderId));

  await decreaseStockForOrder(orderId);
  await clearCartForOrder(orderId);

  return true;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error("Failed to parse webhook body as JSON:", error);
      const params = new URLSearchParams(rawBody);
      body = {
        action: params.get("action"),
        type: params.get("type"),
        data: {
          id: params.get("data.id"),
        },
      };
    }

    const requestUrl = new URL(req.url);
    const dataId = requestUrl.searchParams.get("data.id");
    const signature = req.headers.get("x-signature");
    const requestId = req.headers.get("x-request-id");
    const signatureValidation = isValidWebhookSignature(dataId, requestId, signature);

    if (!signatureValidation.valid) {
      console.warn(
        `Mercado Pago webhook signature not verified (${signatureValidation.reason}); validating payment with Mercado Pago API.`,
      );
    }

    const eventType =
      body?.type ||
      requestUrl.searchParams.get("type") ||
      requestUrl.searchParams.get("topic") ||
      (typeof body?.action === "string" ? body.action.split(".")[0] : null);
    const paymentId =
      dataId ||
      requestUrl.searchParams.get("id") ||
      (body?.data?.id != null ? String(body.data.id) : null);

    if ((eventType !== "payment" && eventType !== "payment.updated") || !paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not set — cannot fetch payment details.");
      return NextResponse.json({ ok: false, error: "Mercado Pago token not configured" }, { status: 500 });
    }

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });

    if (!res.ok) {
      console.error(`Failed to fetch payment ${paymentId} from Mercado Pago:`, res.status);
      return NextResponse.json({ ok: false, error: "Failed to verify payment" }, { status: 502 });
    }

    const payment = await res.json();
    const paymentStatus = String(payment?.status ?? "").toLowerCase();
    const externalReference = payment?.external_reference ?? null;

    if (paymentStatus !== "approved") {
      console.warn(`Payment ${paymentId} is not approved. Current status: ${paymentStatus}`);
      return NextResponse.json({ ok: true, processed: false, status: paymentStatus });
    }

    if (!externalReference || typeof externalReference !== "string") {
      console.warn("Payment has no external_reference:", paymentId);
      return NextResponse.json({ ok: true, processed: false, reason: "missing_external_reference" });
    }

    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, externalReference),
      columns: {
        id: true,
        totalPriceInCents: true,
        status: true,
      },
    });

    if (!order) {
      console.warn(`Payment ${paymentId} references unknown order ${externalReference}.`);
      return NextResponse.json({ ok: true, processed: false, reason: "unknown_order" });
    }

    const paymentTotalCents = Math.round(Number(payment?.total_amount ?? payment?.transaction_amount ?? 0) * 100);
    const orderTotalCents = Number(order.totalPriceInCents ?? 0);

    if (paymentTotalCents !== orderTotalCents) {
      console.warn(`Payment amount mismatch for order ${externalReference}: payment=${paymentTotalCents}, order=${orderTotalCents}`);
      return NextResponse.json({ ok: true, processed: false, reason: "amount_mismatch" });
    }

    await markOrderAsPaid(externalReference, payment.id);

    return NextResponse.json({ ok: true, processed: true, orderId: externalReference });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}
