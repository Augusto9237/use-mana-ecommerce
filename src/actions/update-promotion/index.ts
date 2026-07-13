"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { promotionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { UpdatePromotionSchema, updatePromotionSchema } from "./schema";

type UserWithRole = { role?: string };

export const updatePromotion = async (data: UpdatePromotionSchema) => {
  updatePromotionSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   throw new Error("Acesso negado: apenas administradores podem atualizar promoções");
  // }

  const [updatedPromotion] = await db
    .update(promotionTable)
    .set({
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive,
    })
    .where(eq(promotionTable.id, data.id))
    .returning();

  revalidatePath("/admin/promotions");

  return updatedPromotion;
};
