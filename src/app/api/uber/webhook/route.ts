import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { verifyUberWebhookSignature } from "@/lib/uber";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-uber-signature") || "";

    // Verificar autenticidade do webhook
    const isValid = verifyUberWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error("[Uber Webhook] Assinatura inválida. Rejeitando requisição.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("[Uber Webhook] Falha ao parsear o body:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("[Uber Webhook] Evento recebido:", JSON.stringify(body, null, 2));

    const eventType: string = body?.event_type || "";
    const meta = body?.meta || {};

    // Processar eventos de atualização de status da entrega
    if (eventType === "event.delivery_status" || eventType === "event.courier_update") {
      const externalOrderId: string = meta?.external_order_id || "";
      const uberDeliveryId: string = meta?.order_id || "";
      const status: string = meta?.status || "";

      if (!externalOrderId) {
        console.warn("[Uber Webhook] Evento sem external_order_id. Ignorando.");
        return NextResponse.json({ ok: true });
      }

      console.log(`[Uber Webhook] Atualizando pedido ${externalOrderId} → status Uber: ${status}`);

      try {
        // Buscar o pedido pelo uberDeliveryId ou pelo external_order_id
        const order = await db.query.orderTable.findFirst({
          where: eq(orderTable.id, externalOrderId),
        });

        if (order) {
          await db
            .update(orderTable)
            .set({
              uberDeliveryId: uberDeliveryId || order.uberDeliveryId,
              uberDeliveryStatus: status,
            })
            .where(eq(orderTable.id, externalOrderId));

          console.log(`[Uber Webhook] Pedido ${externalOrderId} atualizado → ${status}`);
        } else {
          console.warn(`[Uber Webhook] Pedido ${externalOrderId} não encontrado no banco.`);
        }
      } catch (e) {
        console.error(`[Uber Webhook] Erro ao atualizar pedido ${externalOrderId}:`, e);
      }
    } else {
      console.log(`[Uber Webhook] Evento ignorado: ${eventType}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Uber Webhook] Erro inesperado:", error);
    // Retorna 200 para evitar reenvios desnecessários
    return NextResponse.json({ ok: false, error: String(error) }, { status: 200 });
  }
}
