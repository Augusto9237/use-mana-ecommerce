import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { AdminLayout } from "@/components/admin/admin-layout";

import PdvContent from "./components/pdv-content";

export default async function PdvPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const categories = await db.query.categoryTable.findMany();

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

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl max-sm:text-xl font-bold">
            Ponto de Venda
          </h1>
          <p className="text-sm text-muted-foreground">
            Registrar vendas presenciais de forma rápida e intuitiva
          </p>
        </div>

        <PdvContent products={validProducts} categories={categories} />
      </div>
    </AdminLayout>
  );
}

