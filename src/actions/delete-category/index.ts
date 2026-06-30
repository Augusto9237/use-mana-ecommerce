"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@/lib/auth";

type UserWithRole = { role?: string };

export const deleteCategory = async (categoryId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem excluir categorias");
  }

  const existingCategory = await db.query.categoryTable.findFirst({
    where: (category, { eq }) => eq(category.id, categoryId),
  });

  if (!existingCategory) {
    throw new Error("Categoria não encontrada");
  }

  await db.delete(categoryTable).where(eq(categoryTable.id, categoryId));
};
