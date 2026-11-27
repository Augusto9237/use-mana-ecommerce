import { sql } from "drizzle-orm";
import { notFound } from "next/navigation";

import { Header } from "@/components/common/header";
import ProductItem from "@/components/common/product-item";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

interface CategoryPageProps {
  params: Promise<{ name: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps){
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const searchTerm = `%${decodedName}%`;

  const products = await db.query.productTable.findMany({
    where: sql`lower(regexp_replace(normalize(${productTable.name}, NFD), U&'[\\0300-\\036f]', '', 'g')) LIKE lower(regexp_replace(normalize(${searchTerm}, NFD), U&'[\\0300-\\036f]', '', 'g'))`,
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />
      <div className="space-y-6 px-5 pt-24 max-w-screen-xl mx-auto">
        <h2 className="text-xl font-semibold">{decodedName}</h2>
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              textContainerClassName="max-w-full"
            />
          ))}
        </div>
      </div>
    </>
  );
};

