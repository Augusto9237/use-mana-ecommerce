"use server";

import { headers } from "next/headers";
import { eq, and, ne } from "drizzle-orm";

import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().min(2),
  sizeInStock: z
    .array(
      z.object({
        size: z.string().min(1, "Tamanho deve ser preenchido"),
        stock: z
          .number()
          .int()
          .nonnegative("Estoque deve ser zero ou maior"),
      })
    )
    .min(1, "Deve ter pelo menos um tamanho"),
  color: z.string().min(1),
  costInCents: z.number().int().positive(),
  priceInCents: z.number().int().positive(),
  imageUrl: z.array(z.string().url()).min(1),
});

type UpdateProductVariantSchema = z.infer<typeof updateProductVariantSchema>;

type UserWithRole = { role?: string };

export const updateProductVariant = async (data: UpdateProductVariantSchema) => {
  updateProductVariantSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem editar variantes");
  }

  const existingVariant = await db.query.productVariantTable.findFirst({
    where: (v, { eq }) => eq(v.id, data.id),
  });

  if (!existingVariant) {
    throw new Error("Variante não encontrada");
  }

  const slugConflict = await db.query.productVariantTable.findFirst({
    where: (v, { and, eq, ne }) =>
      and(eq(v.slug, data.slug), ne(v.id, data.id)),
  });

  if (slugConflict) {
    throw new Error("Já existe outra variante com este slug");
  }

  const [updated] = await db
    .update(productVariantTable)
    .set({
      name: data.name,
      slug: data.slug,
      sizeInStock: data.sizeInStock,
      color: data.color,
      costInCents: data.costInCents,
      priceInCents: data.priceInCents,
      imageUrl: data.imageUrl,
    })
    .where(eq(productVariantTable.id, data.id))
    .returning();

  return updated;
};
