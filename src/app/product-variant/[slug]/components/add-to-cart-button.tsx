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
  tigger?: React.ReactNode;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
  tigger,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Produto adicionado à sacola!");
    },
  });

  if (tigger) {
    return cloneElement(tigger as any, {
      onClick: () => mutate(),
    });
  }

  return (
    <Button
      className="rounded-full"
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
