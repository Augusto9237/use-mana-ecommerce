"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatCentsToBRL } from "@/helpers/money";
import { Button } from "@/components/ui/button";
import { useDecreaseCartProduct } from "@/hooks/mutations/use-decrease-cart-product";
import { useIncreaseCartProduct } from "@/hooks/mutations/use-increase-cart-product";
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";

export interface PdvCartItemData {
  id: string;
  productName: string;
  variantName: string;
  variantColor: string;
  size: string;
  imageUrl: string;
  priceInCents: number;
  quantity: number;
  productVariantId: string;
}

interface PdvCartItemProps {
  item: PdvCartItemData;
  userId: string;
}

const PdvCartItem = ({ item, userId }: PdvCartItemProps) => {
  const decreaseMutation = useDecreaseCartProduct(item.id, userId);
  const increaseMutation = useIncreaseCartProduct(
    item.productVariantId,
    item.size,
    userId,
  );
  const removeMutation = useRemoveProductFromCart(item.id, userId);

  const handleDecrease = () => {
    decreaseMutation.mutate(undefined, {
      onSuccess: () => toast.success("Quantidade do produto diminuída."),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleIncrease = () => {
    increaseMutation.mutate(undefined, {
      onSuccess: () => toast.success("Quantidade do produto aumentada."),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleRemove = () => {
    removeMutation.mutate(undefined, {
      onSuccess: () => toast.success("Produto removido do carrinho."),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="flex items-center justify-between relative gap-2">
      <div className="flex items-center gap-4">
        <Image
          src={item.imageUrl}
          alt={item.variantName}
          width={78}
          height={78}
          className="rounded-lg aspect-square object-cover"
        />
        <div className="flex flex-col gap-1 overflow-hidden h-full">
          <p className="text-sm font-semibold text-nowrap truncate">{item.productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {item.variantColor} • Tam. {item.size}
          </p>
          <div className="flex w-[100px] items-center justify-between rounded-lg border p-1">
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleDecrease}
              disabled={decreaseMutation.isPending}
            >
              <MinusIcon />
            </Button>
            <p className="text-xs font-medium">{item.quantity}</p>
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleIncrease}
              disabled={increaseMutation.isPending}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-full min-h-16 flex flex-1 flex-col items-end justify-end w-8 gap-2">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleRemove}
          className="absolute top-0 rounded-sm"
          disabled={removeMutation.isPending}
        >
          <TrashIcon />
        </Button>
        <p className="text-sm font-bold max-sm:text-xs">
          {formatCentsToBRL(item.priceInCents * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default PdvCartItem;
