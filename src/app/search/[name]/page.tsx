import { eq, ilike } from "drizzle-orm";
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

  const products = await db.query.productTable.findMany({
    where: ilike(productTable.name, `%${decodedName}%`),
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />
      <div className="space-y-6 px-5 pt-20 max-w-screen-xl mx-auto">
        <h2 className="text-xl font-semibold">{decodedName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

