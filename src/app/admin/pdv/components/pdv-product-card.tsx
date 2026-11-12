"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PdvProductCardProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  };
  className?: string;
  textContainerClassName?: string;
  isSelected?: boolean;
  customerId?: string;
  onAdd: (product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  }) => void;
}

const PdvProductCard = ({
  product,
  className,
  textContainerClassName,
  isSelected,
  customerId,
  onAdd,
}: PdvProductCardProps) => {
  const firstVariant = product.variants[0];

  // Evitar renderizar produto sem variantes
  if (!firstVariant) {
    return null;
  }

  const hasDiscount = !!firstVariant.discountPriceInCents;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((firstVariant.priceInCents - firstVariant.discountPriceInCents!) /
          firstVariant.priceInCents) *
          100,
      )
    : 0;
  const detailHref = `/admin/pdv/${firstVariant.slug}${
    customerId ? `?customerId=${encodeURIComponent(customerId)}` : ""
  }`;

  return (
    <Card
      className={cn(
        "w-50 max-sm:w-44 p-0 gap-3 relative group transition-all hover:ring-1 hover:ring-primary cursor-pointer",
        isSelected && "ring-3 ring-primary/50",
        className,
      )}
    >
      {/* Badge de desconto */}
      {hasDiscount && (
        <span className="absolute top-2 right-2 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
          -{discountPercentage}%
        </span>
      )}

      {/* Imagem — mesmo padrão do ProductItem */}
      <Link href={detailHref}>
        <Image
          src={firstVariant.imageUrl[0]}
          alt={firstVariant.name}
          sizes="100vw"
          height={0}
          width={0}
          className="h-auto w-full aspect-square"
        />
      </Link>

      {/* Conteúdo de texto — mesmo padrão do ProductItem */}
      <div
        className={cn(
          "flex flex-col gap-1 px-3 pb-3",
          textContainerClassName,
        )}
      >
        <Link href={detailHref} className="truncate text-sm font-medium">
          {product.name}
        </Link>
        <p className="text-muted-foreground truncate text-xs font-medium">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div>
            {firstVariant.discountPriceInCents ? (
              <div className="flex gap-2 items-center">
                <p className="text-xs font-medium text-muted-foreground line-through">
                  {formatCentsToBRL(firstVariant.priceInCents)}
                </p>
              </div>
            ) : null}
            <p className="truncate font-semibold text-primary text-base">
              {formatCentsToBRL(firstVariant.discountPriceInCents || firstVariant.priceInCents)}
            </p>
          </div>
          <Button
            size="icon"
            className="size-9"
            onClick={() => onAdd(product)}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PdvProductCard;
