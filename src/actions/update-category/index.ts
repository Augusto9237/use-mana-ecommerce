"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdateCategorySchema, updateCategorySchema } from "./schema";

type UserWithRole = { role?: string };

export const updateCategory = async (data: UpdateCategorySchema) => {
  updateCategorySchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   throw new Error("Acesso negado: apenas administradores podem editar categorias");
  // }

  // Verificar se categoria existe
  const existingCategory = await db.query.categoryTable.findFirst({
    where: (category, { eq }) => eq(category.id, data.id),
  });

  if (!existingCategory) {
    throw new Error("Categoria não encontrada");
  }

  // Verificar se slug já pertence a outra categoria
  const slugConflict = await db.query.categoryTable.findFirst({
    where: (category, { and, eq, ne }) =>
      and(eq(category.slug, data.slug), ne(category.id, data.id)),
  });

  if (slugConflict) {
    throw new Error("Já existe outra categoria com este slug");
  }

  const [updatedCategory] = await db
    .update(categoryTable)
    .set({
      name: data.name,
      slug: data.slug,
      imageUrl: data.imageUrl || null,
    })
    .where(eq(categoryTable.id, data.id))
    .returning();

  return updatedCategory;
};
