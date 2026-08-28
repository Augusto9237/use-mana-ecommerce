"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { productTable, productVariantTable } from "@/db/schema";

import ProductItem from "./product-item";

interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

const ProductList = ({ title, products }: ProductListProps) => {
  return (
    <div className="space-y-6">
      <h3 className="px-5 font-semibold">{title}</h3>
      <ScrollArea className="w-full">
        <div className="flex w-max gap-4 px-5 pb-3">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ProductList;
