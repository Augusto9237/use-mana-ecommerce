import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";

import { createUberDelivery } from "./uber";

/**
 * Aciona a criação da entrega na Uber Direct para um pedido já pago.
 * Deve ser chamado após a confirmação de pagamento.
 */
export async function triggerUberDelivery(orderId: string) {
  // Só busca. Não valida regras de negócio — quem chamou já validou.
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: { items: { with: { productVariant: { with: { product: true } } } } },
  });

  if (!order) {
    throw new Error(`Pedido ${orderId} não encontrado`);
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

  const delivery = await createUberDelivery({
    quoteId: order.uberQuoteId!, // quem chamou garantiu que existe
    externalOrderId: orderId,
    dropoffName: order.recipientName,
    dropoffAddress,
    dropoffPhoneNumber: order.phone,
    manifestItems,
  });

  await db
    .update(orderTable)
    .set({
      uberDeliveryId: delivery.id,
      uberDeliveryStatus: delivery.status,
    })
    .where(eq(orderTable.id, orderId));

  return delivery; // ← RETORNA o resultado!
}