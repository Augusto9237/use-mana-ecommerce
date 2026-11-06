"use server";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  createShippingAddressSchema,
  type CreateShippingAddressSchema,
} from "@/actions/create-shipping-address/schema";

type CreateUserParams = {
  email: string;
  password: string;
  name: string;
  role?: "user" | "admin" | ("user" | "admin")[] | undefined;
  address?: Omit<CreateShippingAddressSchema, "email" | "fullName">;
};

export async function createUser({
  email,
  password,
  name,
  role,
  address,
}: CreateUserParams) {
  let userCreated = false;

  try {
    const validatedAddress = address
      ? createShippingAddressSchema.parse({
          ...address,
          email,
          fullName: name,
        })
      : undefined;

    const newUser = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role,
      },
    });
    userCreated = true;

    if (validatedAddress) {
      await db.insert(shippingAddressTable).values({
        userId: newUser.user.id,
        recipientName: validatedAddress.fullName,
        street: validatedAddress.address,
        number: validatedAddress.number,
        complement: validatedAddress.complement || null,
        city: validatedAddress.city,
        state: validatedAddress.state,
        neighborhood: validatedAddress.neighborhood,
        zipCode: validatedAddress.zipCode,
        country: "Brasil",
        phone: validatedAddress.phone,
        email: validatedAddress.email,
        cpfOrCnpj: validatedAddress.cpf,
      });
    }

    return {
      success: true as const,
      data: newUser,
      addressCreated: !!validatedAddress,
    };
  } catch (error) {
    console.error(
      userCreated
        ? "User created but address creation failed:"
        : "Error creating user:",
      error,
    );
    return {
      success: false as const,
      userCreated,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
