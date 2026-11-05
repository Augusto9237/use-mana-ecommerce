import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { AdminLayout } from "@/components/admin/admin-layout";

import PdvContent from "./components/pdv-content";

export default async function PdvPage() {
  await auth.api.getSession({
    headers: await headers(),
  });

  const [categories, customers] = await Promise.all([
    db.query.categoryTable.findMany(),
    db.query.userTable.findMany({
      where: (user, { eq }) => eq(user.role, "user"),
      with: {
        shippingAddresses: {
          limit: 1,
          orderBy: (address, { desc }) => [desc(address.createdAt)],
        },
      },
      orderBy: (users, { asc }) => [asc(users.name)],
    }),
  ]);

  const products = await db.query.productTable.findMany({
    with: {
      category: true,
      variants: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  // Filtrar apenas produtos que possuem ao menos uma variante com imagem
  const validProducts = products.filter(
    (p) => p.variants.length > 0 && p.variants[0].imageUrl.length > 0,
  );

  const customerOptions = customers.map((customer) => {
    const address = customer.shippingAddresses[0];

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: address?.phone ?? null,
      cpfOrCnpj: address?.cpfOrCnpj ?? null,
    };
  });

  return (
    <AdminLayout>
      <PdvContent
        products={validProducts}
        categories={categories}
        customers={customerOptions}
      />
    </AdminLayout>
  );
}
