"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  try {
    addProductToCartSchema.parse(data);
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }
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
      where: (cart, { eq }) => eq(cart.userId, session.user.id),
    });
    let cartId = cart?.id;
    if (!cartId) {
      const [newCart] = await db
        .insert(cartTable)
        .values({
          userId: session.user.id,
        })
        .returning();
      cartId = newCart.id;
    }
    const cartItem = await db.query.cartItemTable.findFirst({
      where: (cartItem, { eq }) =>
        eq(cartItem.cartId, cartId) &&
        eq(cartItem.productVariantId, data.productVariantId),
    });
    const requestedQuantity = (cartItem?.quantity ?? 0) + data.quantity;
    console.log('test resquestedQuantity', requestedQuantity);
    if (sizeInStock.stock < requestedQuantity) {
      throw new Error(
        `Estoque insuficiente. Disponível: ${sizeInStock.stock - (cartItem?.quantity ?? 0)} unidade(s).`,
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

    return { success: true as const };
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Erro ao adicionar produto ao carrinho.",
    };
  }
};
