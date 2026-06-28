"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdateProductSchema, updateProductSchema } from "./schema";

type UserWithRole = { role?: string };

export const updateProduct = async (data: UpdateProductSchema) => {
  updateProductSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem editar produtos");
  }

  // Verificar se produto existe
  const existingProduct = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.id, data.id),
  });

  if (!existingProduct) {
    throw new Error("Produto não encontrado");
  }

  // Verificar se slug já pertence a outro produto
  const slugConflict = await db.query.productTable.findFirst({
    where: (product, { and, eq, ne }) =>
      and(eq(product.slug, data.slug), ne(product.id, data.id)),
  });

  if (slugConflict) {
    throw new Error("Já existe outro produto com este slug");
  }

  const [updatedProduct] = await db
    .update(productTable)
    .set({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      slug: data.slug,
    })
    .where(eq(productTable.id, data.id))
    .returning();

  return updatedProduct;
};
