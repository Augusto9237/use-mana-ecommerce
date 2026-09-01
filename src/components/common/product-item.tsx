import Image from "next/image";
import Link from "next/link";

import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import AddToCartButton from "@/app/product-variant/[slug]/components/add-to-cart-button";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductItemProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  };
  textContainerClassName?: string;
}

const ProductItem = ({ product, textContainerClassName }: ProductItemProps) => {
  const firstVariant = product.variants[0];

  // Evitar renderizar produto sem variantes
  if (!firstVariant) {
    return null;
  }

  return (

    <Card className="min-w-50 max-sm:min-w-44 p-0 gap-3">
      <Link
        href={`/product-variant/${firstVariant.slug}`}
      >
        <Image
          src={firstVariant.imageUrl[0]}
          alt={firstVariant.name}
          sizes="100vw"
          height={0}
          width={0}
          className="h-auto w-full rounded-lg"
        />
      </Link>
      <div
        className={cn(
          "flex w-full min-w-50 max-w-50 max-sm:min-w-44 max-sm:max-w-44 flex-col gap-1 px-3 pb-3",
          textContainerClassName,
        )}
      >
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs font-medium">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <p className="truncate font-semibold text-primary">
            {formatCentsToBRL(firstVariant.priceInCents)}
          </p>
          <AddToCartButton
            productVariantId={firstVariant.id}
            quantity={1}
            tigger={
              <Button size="icon" className="size-9">
                <ShoppingCart />
              </Button>}
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductItem;
