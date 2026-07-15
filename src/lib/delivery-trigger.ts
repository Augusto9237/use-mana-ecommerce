import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";

import { createUberDelivery } from "./uber";

/**
 * Aciona a criação da entrega na Uber Direct para um pedido já pago.
 * Deve ser chamado após a confirmação de pagamento.
 */
export async function triggerUberDelivery(orderId: string): Promise<void> {
  // Buscar pedido com todos os itens necessários
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    console.error(`[Uber Trigger] Pedido ${orderId} não encontrado.`);
    return;
  }

  // Só dispara se houver um quoteId salvo (cotação da Uber)
  if (!order.uberQuoteId) {
    console.warn(`[Uber Trigger] Pedido ${orderId} não possui uberQuoteId. Entrega Uber não será criada.`);
    return;
  }

  // Evita criar entrega duplicada
  if (order.uberDeliveryId) {
    console.warn(`[Uber Trigger] Pedido ${orderId} já possui entrega Uber: ${order.uberDeliveryId}. Ignorando.`);
    return;
  }

  // Monta o endereço de entrega formatado
  const dropoffAddress = `${order.street}, ${order.number}${
    order.complement ? ` - ${order.complement}` : ""
  } - ${order.neighborhood}, ${order.city} - ${order.state}, ${order.zipCode}, ${order.country || "Brasil"}`;

  // Monta os itens do manifesto para a Uber
  const manifestItems = order.items.map((item) => ({
    name: `${item.productVariant.product.name} - ${item.productVariant.name}`,
    quantity: item.quantity,
    size: "medium" as const,
    price: item.priceInCents,
  }));

  try {
    console.log(`[Uber Trigger] Criando entrega na Uber para o pedido ${orderId}...`);

    const delivery = await createUberDelivery({
      quoteId: order.uberQuoteId,
      externalOrderId: orderId,
      dropoffName: order.recipientName,
      dropoffAddress,
      dropoffPhoneNumber: order.phone,
      manifestItems,
    });

    // Salva os dados de entrega no banco de dados
    await db
      .update(orderTable)
      .set({
        uberDeliveryId: delivery.id,
        uberDeliveryStatus: delivery.status,
      })
      .where(eq(orderTable.id, orderId));

    console.log(`[Uber Trigger] Entrega criada com sucesso: ${delivery.id} | Status: ${delivery.status}`);
  } catch (error) {
    console.error(`[Uber Trigger] Falha ao criar entrega na Uber para o pedido ${orderId}:`, error);

    // Marca o status como erro para facilitar diagnóstico
    await db
      .update(orderTable)
      .set({ uberDeliveryStatus: "dispatch_error" })
      .where(eq(orderTable.id, orderId));
  }
}
