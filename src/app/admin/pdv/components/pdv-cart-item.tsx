"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";

import { formatCentsToBRL } from "@/helpers/money";
import { Button } from "@/components/ui/button";

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
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

const PdvCartItem = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: PdvCartItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={item.imageUrl}
          alt={item.variantName}
          width={78}
          height={78}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{item.productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {item.variantColor} • Tam. {item.size}
          </p>
          <div className="flex w-[100px] items-center justify-between rounded-lg border p-1">
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={() => onDecrease(item.id)}
            >
              <MinusIcon />
            </Button>
            <p className="text-xs font-medium">{item.quantity}</p>
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={() => onIncrease(item.id)}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRemove(item.id)}
        >
          <TrashIcon />
        </Button>
        <p className="text-sm max-sm:text-xs font-bold">
          {formatCentsToBRL(item.priceInCents * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default PdvCartItem;
