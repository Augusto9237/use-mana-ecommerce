"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CreateCategorySchema, createCategorySchema } from "./schema";

type UserWithRole = { role?: string };

export const createCategory = async (data: CreateCategorySchema) => {
  createCategorySchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se usuário é admin
  const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   throw new Error("Acesso negado: apenas administradores podem criar categorias");
  // }

  // Verificar se slug já existe
  const existingCategory = await db.query.categoryTable.findFirst({
    where: (category, { eq }) => eq(category.slug, data.slug),
  });

  if (existingCategory) {
    throw new Error("Categoria com este slug já existe");
  }

  const [newCategory] = await db
    .insert(categoryTable)
    .values({
      name: data.name,
      slug: data.slug,
      imageUrl: data.imageUrl || null,
    })
    .returning();

  return newCategory;
};
