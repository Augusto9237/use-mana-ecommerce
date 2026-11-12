import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatCentsToBRL } from "@/helpers/money";
import { useDecreaseCartProduct } from "@/hooks/mutations/use-decrease-cart-product";
import { useIncreaseCartProduct } from "@/hooks/mutations/use-increase-cart-product";
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";

import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantId: string;
  size: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productName,
  productVariantId,
  size,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
}: CartItemProps) => {
  const removeProductFromCartMutation = useRemoveProductFromCart(id);
  const decreaseCartProductQuantityMutation = useDecreaseCartProduct(id);
  const increaseCartProductQuantityMutation =
    useIncreaseCartProduct(productVariantId, size);
  const handleDeleteClick = () => {
    removeProductFromCartMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Produto removido do carrinho.");
      },
      onError: () => {
        toast.error("Erro ao remover produto do carrinho.");
      },
    });
  };
  const handleDecreaseQuantityClick = () => {
    decreaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto diminuida.");
      },
    });
  };
  const handleIncreaseQuantityClick = () => {
    increaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto aumentada.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  return (
    <div className="flex items-center justify-between min-h-0 flex-1 max-h-[110px] relative">
      <div className="flex items-center gap-4 h-full w-full">
        <Image
          src={productVariantImageUrl}
          alt={productVariantName}
          width={78}
          height={78}
          className="rounded-lg aspect-square object-cover"
        />
        <div className="flex flex-col min-h-0 flex-1 h-full w-full jusftify-between ">
          <p className="text-sm font-semibold">{productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {productVariantName}
          </p>

          <div className="flex items-center justify-between w-full mt-4">
            <p className="text-sm max-sm:text-xs font-bold">
              {formatCentsToBRL(productVariantPriceInCents)}
            </p>
            <div className="flex w-[100px] items-center justify-between rounded-md border p-1">
              <Button
                className="h-4 w-4"
                variant="ghost"
                onClick={handleDecreaseQuantityClick}
              >
                <MinusIcon />
              </Button>
              <p className="text-xs font-medium">{quantity}</p>
              <Button
                className="h-4 w-4"
                variant="ghost"
                onClick={handleIncreaseQuantityClick}
              >
                <PlusIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Button variant="outline"
        size="icon-xs"
        className="absolute top-0 right-0 hover:text-destructive"
        onClick={handleDeleteClick}>
        <TrashIcon />
      </Button>
    </div>
  );
};

export default CartItem;
