"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddProductToCartSchema, addProductToCartSchema } from "./schema";

const addProductToUserCart = async (
  data: AddProductToCartSchema,
  userId: string,
) => {
  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) =>
      eq(productVariant.id, data.productVariantId),
  });
  if (!productVariant) {
    throw new Error("Produto não encontrado");
  }
  const sizeInStock = productVariant.sizeInStock.find(
    (sizeInStock) => sizeInStock.size === data.size,
  );
  if (!sizeInStock) {
    throw new Error("Tamanho selecionado não encontrado");
  }
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });
  let cartId = cart?.id;
  if (!cartId) {
    const [newCart] = await db.insert(cartTable).values({ userId }).returning();
    cartId = newCart.id;
  }
  const now = new Date();
  const brasilDateStr = now.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const startOfDay = new Date(`${brasilDateStr}T00:00:00-03:00`);

  const todayOrderItems = await db.query.orderItemTable.findMany({
    where: (orderItem, { eq, gte, and }) =>
      and(
        eq(orderItem.productVariantId, data.productVariantId),
        gte(orderItem.createdAt, startOfDay),
      ),
    with: {
      order: {
        columns: {
          status: true,
        },
      },
    },
  });

  const orderedTodayQuantity = todayOrderItems
    .filter((item) => item.order?.status !== "canceled")
    .reduce((sum, item) => sum + item.quantity, 0);

  const availableStock = sizeInStock.stock - orderedTodayQuantity;

  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq, and }) =>
      and(
        eq(cartItem.cartId, cartId),
        eq(cartItem.productVariantId, data.productVariantId),
      ),
  });
  const currentCartQuantity = cartItem?.quantity ?? 0;
  const requestedQuantity = currentCartQuantity + data.quantity;

  if (availableStock < requestedQuantity) {
    const remainingAvailable = Math.max(
      0,
      availableStock - currentCartQuantity,
    );
    throw new Error(
      `Estoque insuficiente. Disponível: ${remainingAvailable} unidade(s).`,
    );
  }
  if (cartItem) {
    await db
      .update(cartItemTable)
      .set({
        quantity: requestedQuantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
  } else {
    await db.insert(cartItemTable).values({
      cartId,
      productVariantId: data.productVariantId,
      quantity: data.quantity,
    });
  }
};

const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export const addProductToCart = async (data: AddProductToCartSchema) => {
  try {
    addProductToCartSchema.parse(data);
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    await addProductToUserCart(data, session.user.id);
    return { success: true as const };
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar produto ao carrinho.",
    };
  }
};

export const addProductToPdvCart = async (
  data: AddProductToCartSchema,
  userId: string,
) => {
  try {
    addProductToCartSchema.parse(data);
    if (typeof userId !== "string" || !userId.trim()) {
      throw new Error("Cliente não informado");
    }

    // const session = await getSession();
    // if (!session?.user || session.user.role !== "admin") {
    //   throw new Error("Apenas administradores podem adicionar produtos ao PDV");
    // }

    const customer = await db.query.userTable.findFirst({
      where: (user, { eq, and }) =>
        and(eq(user.id, userId), eq(user.role, "user")),
      columns: { id: true },
    });
    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    await addProductToUserCart(data, customer.id);
    return { success: true as const };
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho do PDV:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao adicionar produto ao carrinho do PDV.",
    };
  }
};
