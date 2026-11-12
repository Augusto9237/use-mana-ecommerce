"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import AddToCartButton from "./add-to-cart-button";
import { SizeSelector } from "./size-selector.";

interface ProductActionsProps {
  productVariantId: string;
  sizes: Array<{ size: string; stock: number }> | null;
}

const ProductActions = ({ productVariantId, sizes }: ProductActionsProps) => {
  const [selectedSize, setSelectedSize] = useState(sizes ? sizes[0].size : "");
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <>
      <div className="px-5">
        <div className="flex items-center justify-between w-full">
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Tamanho</h3>
            <SizeSelector sizes={sizes} setSelectedSize={setSelectedSize} />
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Quantidade</h3>
            <div className="flex w-[100px] items-center justify-between rounded-lg border">
              <Button size="icon-sm" variant="ghost" onClick={handleDecrement}>
                <MinusIcon />
              </Button>
              <p>{quantity}</p>
              <Button size="icon-sm" variant="ghost" onClick={handleIncrement}>
                <PlusIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 px-5">
        <AddToCartButton
          productVariantId={productVariantId}
          quantity={quantity}
          size={selectedSize}
        />
      </div>
    </>
  );
};

export default ProductActions;
