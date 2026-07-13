"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { promotionTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const deletePromotion = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const [deletedPromotion] = await db
    .delete(promotionTable)
    .where(eq(promotionTable.id, id))
    .returning();

  revalidatePath("/admin/promotions");

  return deletedPromotion;
};
