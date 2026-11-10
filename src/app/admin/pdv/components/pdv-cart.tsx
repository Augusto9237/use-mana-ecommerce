"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { removeProductFromCart } from "@/actions/remove-cart-product";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";
import { getUsePdvCartQueryKey, usePdvCart } from "@/hooks/queries/use-cart";

import PdvCartItem from "./pdv-cart-item";
import type { PdvCustomer } from "./search-customers";

interface PdvCartProps {
  selectedCustomer: PdvCustomer | null;
}

const PdvCart = ({ selectedCustomer }: PdvCartProps) => {
  const queryClient = useQueryClient();
  const { data: cart, isPending, isError } = usePdvCart(selectedCustomer?.id);
  const clearCartMutation = useMutation({
    mutationFn: (cartItemIds: string[]) =>
      Promise.all(
        cartItemIds.map((cartItemId) => removeProductFromCart({ cartItemId })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUsePdvCartQueryKey(selectedCustomer?.id),
      });
    },
  });

  const handleClearCart = () => {
    if (!cart?.items.length) return;

    clearCartMutation.mutate(
      cart.items.map((item) => item.id),
      {
        onSuccess: () => toast.success("Carrinho limpo."),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Card className="w-full max-w-sm flex-1 flex-col gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-5 py-4 relative">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>Carrinho</CardTitle>
          {selectedCustomer && (
            <CardDescription>Cliente: {selectedCustomer.name}</CardDescription>
          )}
        </div>
        {!!cart?.items.length && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs absolute top-4 right-4"
            disabled={clearCartMutation.isPending}
            onClick={handleClearCart}
          >
            <Trash2 className="mr-1 size-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex h-full flex-col overflow-hidden px-5 pt-4 pb-5">
        <div className="flex h-full max-h-full flex-col overflow-hidden">
          <ScrollArea className="h-full">
            {!selectedCustomer ? (
              <div className="text-muted-foreground flex h-40 items-center justify-center">
                <p className="text-sm">Selecione um cliente.</p>
              </div>
            ) : isPending ? (
              <div className="text-muted-foreground flex h-40 items-center justify-center">
                <p className="text-sm">Carregando carrinho...</p>
              </div>
            ) : isError ? (
              <div className="text-destructive flex h-40 items-center justify-center">
                <p className="text-sm">Não foi possível carregar o carrinho.</p>
              </div>
            ) : !cart?.items.length ? (
              <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2">
                <p className="text-sm">Carrinho vazio</p>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-5">
                {cart.items.map((item) => (
                  <PdvCartItem
                    key={item.id}
                    userId={selectedCustomer.id}
                    item={{
                      id: item.id,
                      productName: item.productVariant.product.name,
                      variantName: item.productVariant.name,
                      variantColor: item.productVariant.color,
                      size: item.productVariant.sizeInStock[0]?.size ?? "",
                      imageUrl: item.productVariant.imageUrl[0] ?? "",
                      priceInCents:
                        item.productVariant.discountPriceInCents ??
                        item.productVariant.priceInCents,
                      quantity: item.quantity,
                      productVariantId: item.productVariant.id,
                    }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {!!cart?.items.length && (
          <div className="flex flex-col gap-4">
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <p>Total</p>
              <p>{formatCentsToBRL(cart.totalPriceInCents)}</p>
            </div>
            <Button className="mt-5" asChild>
              <Link
                href={`/admin/pdv/confimation?customerId=${selectedCustomer?.id}`}
              >
                Finalizar venda
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PdvCart;
