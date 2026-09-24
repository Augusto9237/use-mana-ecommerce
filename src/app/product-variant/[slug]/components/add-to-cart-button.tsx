"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { cloneElement } from "react";

import { addProductToCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
  size: string;
  tigger?: React.ReactNode;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
  size,
  tigger,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: async () => {
      const result = await addProductToCart({
        productVariantId,
        quantity,
        size,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Produto adicionado à sacola!");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (tigger) {
    return cloneElement(tigger as any, {
      onClick: () => mutate(),
    });
  }

  return (
    <Button
      size="lg"
      variant="default"
      disabled={isPending}
      onClick={() => mutate()}
    >
      {isPending && <Loader2 className="animate-spin" />}
      Adicionar à sacola
    </Button>
  );
};

export default AddToCartButton;
