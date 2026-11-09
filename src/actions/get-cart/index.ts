"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getCart = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
    with: {
      shippingAddress: true,
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
  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: session.user.id,
      })
      .returning();
    return {
      ...newCart,
      items: [],
      totalPriceInCents: 0,
      shippingAddress: null,
    };
  }
  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) =>
        acc +
        (item.productVariant.discountPriceInCents ||
          item.productVariant.priceInCents) *
          item.quantity,
      0,
    ),
  };
};

export const getPdvCart = async (userId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("Cliente não informado");
  }

  const customer = await db.query.userTable.findFirst({
    where: (user, { eq, and }) =>
      and(eq(user.id, userId), eq(user.role, "user")),
    columns: { id: true },
  });
  if (!customer) {
    throw new Error("Cliente não encontrado");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, customer.id),
    with: {
      shippingAddress: true,
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
  if (!cart) {
    return null;
  }

  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) =>
        acc +
        (item.productVariant.discountPriceInCents ||
          item.productVariant.priceInCents) *
          item.quantity,
      0,
    ),
  };
};
