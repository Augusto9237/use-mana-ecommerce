"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { auth } from "@/lib/auth";

type UserWithRole = { role?: string };

export const deleteProductVariant = async (variantId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem excluir variantes");
  }

  const existing = await db.query.productVariantTable.findFirst({
    where: (v, { eq }) => eq(v.id, variantId),
  });

  if (!existing) {
    throw new Error("Variante não encontrada");
  }

  await db.delete(productVariantTable).where(eq(productVariantTable.id, variantId));
};
