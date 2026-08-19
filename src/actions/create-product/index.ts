"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import type { InferModel } from "drizzle-orm";
import { auth } from "@/lib/auth";

import {
  CreateProductSchema,
  CreateProductVariantSchema,
  createProductSchema,
  createProductVariantSchema,
} from "./schema";

type UserWithRole = { role?: string };

export const createProduct = async (data: CreateProductSchema) => {
  createProductSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se usuário é admin
  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem criar produtos");
  }

  // Verificar se slug já existe
  const existingProduct = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.slug, data.slug),
  });

  if (existingProduct) {
    throw new Error("Produto com este slug já existe");
  }

  const [newProduct] = await db
    .insert(productTable)
    .values({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      slug: data.slug,
    })
    .returning();

  return newProduct;
};

export const createProductVariant = async (
  data: CreateProductVariantSchema
) => {
  createProductVariantSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se usuário é admin
  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem criar variantes");
  }

  // Verificar se produto existe
  const product = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.id, data.productId),
  });

  if (!product) {
    throw new Error("Produto não encontrado");
  }

  // Verificar se slug já existe
  const existingVariant = await db.query.productVariantTable.findFirst({
    where: (variant, { eq }) => eq(variant.slug, data.slug),
  });

  if (existingVariant) {
    throw new Error("Variante com este slug já existe");
  }

  type NewProductVariant = InferModel<typeof productVariantTable, "insert">;

  const newVariantData = {
    productId: data.productId,
    name: data.name,
    slug: data.slug,
    sizeInStock: data.sizeInStock,
    color: data.color,
    costInCents: data.costInCents,
    priceInCents: data.priceInCents,
    discountPriceInCents: data.discountPriceInCents ?? null,
    imageUrl: data.imageUrl,
  } as NewProductVariant;

  const [newVariant] = await db.insert(productVariantTable).values(newVariantData).returning();

  return newVariant;
};
