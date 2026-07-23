"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  UpdateShippingAddressSchema,
  updateShippingAddressSchema,
} from "./schema";

export const updateShippingAddress = async (
  data: UpdateShippingAddressSchema,
) => {
  updateShippingAddressSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [shippingAddress] = await db
    .update(shippingAddressTable)
    .set({
      recipientName: data.fullName,
      street: data.address,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood,
      zipCode: data.zipCode,
      phone: data.phone,
      email: data.email,
      cpfOrCnpj: data.cpf,
    })
    .where(eq(shippingAddressTable.id, data.id))
    .returning();

  revalidatePath("/cart/identification");
  revalidatePath("/addreses");

  return shippingAddress;
};
