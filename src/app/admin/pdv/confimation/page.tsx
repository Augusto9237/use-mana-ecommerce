import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { AdminLayout } from "@/components/admin/admin-layout";
import { db } from "@/db";
import { shippingAddressTable, userTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { PdvConfirmationContent } from "./components/pdv-confirmation-content";

interface PdvConfirmationPageProps {
  searchParams: Promise<{
    customerId?: string;
    userId?: string;
  }>;
}

export default async function PdvConfirmationPage(
  props: PdvConfirmationPageProps,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const customerId = searchParams.customerId || searchParams.userId;

  if (!customerId) {
    redirect("/admin/pdv");
  }

  // Busca os dados do cliente
  const customer = await db.query.userTable.findFirst({
    where: (user, { eq, and }) =>
      and(eq(user.id, customerId), eq(user.role, "user")),
    with: {
      shippingAddresses: {
        orderBy: (address, { desc }) => [desc(address.createdAt)],
      },
    },
  });

  if (!customer) {
    redirect("/admin/pdv");
  }

  // Busca o carrinho do cliente no PDV
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, customer.id),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  const shippingAddresses = await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, customer.id),
    orderBy: (address, { desc }) => [desc(address.createdAt)],
  });

  const cartItems =
    cart?.items.map((item) => ({
      id: item.id,
      name: item.productVariant.product.name,
      variantName: item.productVariant.name,
      color: item.productVariant.color,
      size: item.productVariant.sizeInStock[0]?.size ?? "Único",
      quantity: item.quantity,
      priceInCents:
        item.productVariant.discountPriceInCents ??
        item.productVariant.priceInCents,
      imageUrl: item.productVariant.imageUrl[0] ?? "",
    })) ?? [];

  return (
    <AdminLayout>
      <div className="w-full  py-2">
        <PdvConfirmationContent
          customer={{
            id: customer.id,
            name: customer.name,
            email: customer.email,
            image: customer.image,
          }}
          addresses={shippingAddresses}
          defaultShippingAddressId={cart?.shippingAddress?.id || null}
          items={cartItems}
        />
      </div>
    </AdminLayout>
  );
}

