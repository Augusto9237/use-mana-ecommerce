"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
  productVariantTable,
  shippingAddressTable,
  userTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  createShippingAddressSchema,
  type CreateShippingAddressSchema,
} from "../create-shipping-address/schema";
import { updateShippingAddressSchema } from "../update-shipping-address/schema";

const getAdminSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Não autorizado. Apenas administradores podem acessar o PDV.");
  }

  return session;
};

/**
 * Cria um endereço de entrega para o cliente selecionado no PDV
 */
export const createPdvShippingAddress = async (
  data: CreateShippingAddressSchema,
  customerId: string,
) => {
  await getAdminSession();
  createShippingAddressSchema.parse(data);

  if (!customerId) {
    throw new Error("Cliente não informado.");
  }

  const customer = await db.query.userTable.findFirst({
    where: (user, { eq, and }) =>
      and(eq(user.id, customerId), eq(user.role, "user")),
  });

  if (!customer) {
    throw new Error("Cliente não encontrado.");
  }

  const [shippingAddress] = await db
    .insert(shippingAddressTable)
    .values({
      userId: customer.id,
      recipientName: data.fullName,
      street: data.address,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood,
      zipCode: data.zipCode,
      country: "Brasil",
      phone: data.phone,
      email: data.email,
      cpfOrCnpj: data.cpf,
    })
    .returning();

  // Vincula automaticamente ao carrinho do cliente
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, customer.id),
  });

  if (cart) {
    await db
      .update(cartTable)
      .set({ shippingAddressId: shippingAddress.id })
      .where(eq(cartTable.id, cart.id));
  }

  revalidatePath(`/admin/pdv/confimation?customerId=${customerId}`);
  revalidatePath(`/admin/pdv/confirmation?customerId=${customerId}`);

  return shippingAddress;
};

export const updatePdvShippingAddress = async ({
  customerId,
  addressId,
  data,
}: {
  customerId: string;
  addressId: string;
  data: CreateShippingAddressSchema;
}) => {
  await getAdminSession();
  const customer = await db.query.userTable.findFirst({
    where: (user, { eq, and }) =>
      and(eq(user.id, customerId), eq(user.role, "user")),
  });

  if (!customer) {
    throw new Error("Cliente não encontrado.");
  }

  const validatedData = updateShippingAddressSchema.parse({
    id: addressId,
    ...data,
  });

  const [shippingAddress] = await db
    .update(shippingAddressTable)
    .set({
      recipientName: validatedData.fullName,
      street: validatedData.address,
      number: validatedData.number,
      complement: validatedData.complement || null,
      city: validatedData.city,
      state: validatedData.state,
      neighborhood: validatedData.neighborhood,
      zipCode: validatedData.zipCode,
      phone: validatedData.phone,
      email: validatedData.email,
      cpfOrCnpj: validatedData.cpf,
    })
    .where(
      and(
        eq(shippingAddressTable.id, addressId),
        eq(shippingAddressTable.userId, customerId),
      ),
    )
    .returning();

  if (!shippingAddress) {
    throw new Error("Endereço de entrega não encontrado para este cliente.");
  }

  revalidatePath(`/admin/pdv/confimation?customerId=${customerId}`);
  return shippingAddress;
};

/**
 * Vincula um endereço de entrega existente ao carrinho do cliente no PDV
 */
export const updatePdvCartShippingAddress = async ({
  customerId,
  shippingAddressId,
}: {
  customerId: string;
  shippingAddressId: string | null;
}) => {
  await getAdminSession();

  if (!customerId) {
    throw new Error("Cliente não informado.");
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, customerId),
  });

  if (!cart) {
    throw new Error("Carrinho do cliente não encontrado.");
  }

  if (shippingAddressId) {
    const shippingAddress = await db.query.shippingAddressTable.findFirst({
      where: and(
        eq(shippingAddressTable.id, shippingAddressId),
        eq(shippingAddressTable.userId, customerId),
      ),
    });

    if (!shippingAddress) {
      throw new Error("Endereço de entrega não encontrado para este cliente.");
    }
  }

  await db
    .update(cartTable)
    .set({
      shippingAddressId,
    })
    .where(eq(cartTable.id, cart.id));

  revalidatePath(`/admin/pdv/confimation?customerId=${customerId}`);
  revalidatePath(`/admin/pdv/confirmation?customerId=${customerId}`);

  return { success: true };
};

interface FinishPdvOrderParams {
  customerId: string;
  shippingAddressId?: string | null;
  paymentMethod: "money" | "pix" | "credit_card" | "debit_card";
  deliveryType: "pickup" | "delivery";
  shippingFeeInCents?: number;
}

/**
 * Conclui o pedido feito no PDV:
 * 1. Registra o pedido com status 'paid'
 * 2. Registra os itens do pedido
 * 3. Abate o estoque das variantes
 * 4. Limpa o carrinho do cliente
 */
export const finishPdvOrder = async ({
  customerId,
  shippingAddressId,
  paymentMethod,
  deliveryType,
  shippingFeeInCents = 0,
}: FinishPdvOrderParams) => {
  const session = await getAdminSession();

  if (!customerId) {
    throw new Error("Cliente não informado.");
  }

  const customer = await db.query.userTable.findFirst({
    where: eq(userTable.id, customerId),
  });

  if (!customer) {
    throw new Error("Cliente não encontrado.");
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, customerId),
    with: {
      items: {
        with: {
          productVariant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Carrinho vazio ou não encontrado.");
  }

  const shippingAddress =
    deliveryType === "delivery" && shippingAddressId
      ? await db.query.shippingAddressTable.findFirst({
          where: eq(shippingAddressTable.id, shippingAddressId),
        })
      : undefined;

  if (deliveryType === "delivery" && !shippingAddress) {
    throw new Error("Endereço de entrega/cobrança não encontrado.");
  }

  const itemsTotal = cart.items.reduce(
    (acc, item) =>
      acc +
      (item.productVariant.discountPriceInCents ??
        item.productVariant.priceInCents) *
        item.quantity,
    0,
  );

  const finalShippingFee = deliveryType === "pickup" ? 0 : shippingFeeInCents;
  const totalPriceInCents = itemsTotal + finalShippingFee;

  let orderId: string | undefined;

  await db.transaction(async (tx) => {
    // 1. Criar pedido
    const [order] = await tx
      .insert(orderTable)
      .values({
        userId: customer.id,
        shippingAddressId: shippingAddress?.id ?? null,
        recipientName: shippingAddress?.recipientName ?? customer.name,
        street: shippingAddress?.street ?? null,
        number: shippingAddress?.number ?? null,
        complement: shippingAddress?.complement ?? null,
        city: shippingAddress?.city ?? null,
        state: shippingAddress?.state ?? null,
        neighborhood: shippingAddress?.neighborhood ?? null,
        zipCode: shippingAddress?.zipCode ?? null,
        country: shippingAddress?.country ?? null,
        phone: shippingAddress?.phone ?? null,
        email: shippingAddress?.email ?? customer.email,
        cpfOrCnpj: shippingAddress?.cpfOrCnpj ?? null,
        totalPriceInCents,
        shippingFeeInCents: finalShippingFee,
        paymentId: `pdv_${paymentMethod}_${Date.now()}`,
        status: "paid",
      })
      .returning();

    if (!order) {
      throw new Error("Falha ao registrar o pedido no PDV.");
    }

    orderId = order.id;

    // 2. Criar itens do pedido
    const orderItemsPayload = cart.items.map((item) => ({
      orderId: order.id,
      productVariantId: item.productVariant.id,
      quantity: item.quantity,
      priceInCents:
        item.productVariant.discountPriceInCents ??
        item.productVariant.priceInCents,
    }));

    await tx.insert(orderItemTable).values(orderItemsPayload);

    // 3. Abater o estoque das variantes
    for (const item of cart.items) {
      let quantityToSubtract = item.quantity;
      const sizeInStock = item.productVariant.sizeInStock.map((stockItem) => {
        if (quantityToSubtract <= 0) return stockItem;

        const quantitySubtracted = Math.min(
          stockItem.stock,
          quantityToSubtract,
        );
        quantityToSubtract -= quantitySubtracted;

        return {
          ...stockItem,
          stock: stockItem.stock - quantitySubtracted,
        };
      });

      await tx
        .update(productVariantTable)
        .set({ sizeInStock })
        .where(eq(productVariantTable.id, item.productVariant.id));
    }

    // 4. Limpar o carrinho do cliente
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
  });

  if (!orderId) {
    throw new Error("Falha ao concluir a venda no PDV.");
  }

  revalidatePath("/admin/pdv");
  revalidatePath("/admin/orders");

  return { success: true, orderId };
};

