"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productTable } from "@/db/schema";
import { auth } from "@/lib/auth";

type UserWithRole = { role?: string };

export const deleteProduct = async (productId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem excluir produtos");
  }

  const existingProduct = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.id, productId),
  });

  if (!existingProduct) {
    throw new Error("Produto não encontrado");
  }

  await db.delete(productTable).where(eq(productTable.id, productId));
};
