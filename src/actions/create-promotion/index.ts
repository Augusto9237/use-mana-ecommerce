"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { promotionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { CreatePromotionSchema, createPromotionSchema } from "./schema";

type UserWithRole = { role?: string };

export const createPromotion = async (data: CreatePromotionSchema) => {
  createPromotionSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   throw new Error("Acesso negado: apenas administradores podem criar promoções");
  // }

  const [newPromotion] = await db
    .insert(promotionTable)
    .values({
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive,
    })
    .returning();

  revalidatePath("/admin/promotions");

  return newPromotion;
};
