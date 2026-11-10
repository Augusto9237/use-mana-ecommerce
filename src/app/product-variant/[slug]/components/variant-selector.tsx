import Image from "next/image";
import Link from "next/link";

import { productVariantTable } from "@/db/schema";

interface VariantSelectorProps {
  selectedVariantSlug: string;
  variants: (typeof productVariantTable.$inferSelect)[];
  basePath?: string;
  customerId?: string;
}

export default function VariantSelector({
  selectedVariantSlug,
  variants,
  basePath = "/product-variant",
  customerId,
}: VariantSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      {variants.map((variant) => (
        <Link
          href={`${basePath}/${variant.slug}${
            customerId ? `?customerId=${encodeURIComponent(customerId)}` : ""
          }`}
          key={variant.id}
          className={
            selectedVariantSlug === variant.slug
              ? "border-primary rounded-xl border-2 overflow-hidden"
              : ""
          }
        >
          <Image
            width={68}
            height={68}
            src={variant.imageUrl[0]}
            alt={variant.name}
            className="rounded-[0.60rem]"
          />
        </Link>
      ))}
    </div>
  );
};
