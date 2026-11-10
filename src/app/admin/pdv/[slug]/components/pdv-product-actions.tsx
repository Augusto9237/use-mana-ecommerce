"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { addProductToPdvCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getUsePdvCartQueryKey } from "@/hooks/queries/use-cart";

import SearchCustomers, {
  type PdvCustomer,
} from "../../components/search-customers";

interface PdvProductActionsProps {
  productVariantId: string;
  sizes: Array<{ size: string; stock: number }>;
  customers: PdvCustomer[];
}

const PdvProductActions = ({
  productVariantId,
  sizes,
  customers,
}: PdvProductActionsProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<PdvCustomer | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState(
    sizes.find((item) => item.stock > 0)?.size ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();
  const addToCartMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!selectedCustomer) {
        throw new Error("Selecione um cliente antes de adicionar produtos.");
      }

      const result = await addProductToPdvCart(
        {
          productVariantId,
          size: selectedSize,
          quantity,
        },
        userId,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return { result, userId };
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({
        queryKey: getUsePdvCartQueryKey(userId),
      });
      toast.success("Produto adicionado à venda.");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-6 px-5">
      <SearchCustomers
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-4">
          <h3 className="font-medium">Tamanho</h3>
          <ToggleGroup
            variant="outline"
            type="single"
            value={selectedSize}
            onValueChange={(size) => {
              if (size) setSelectedSize(size);
            }}
          >
            {sizes.map((item) => (
              <ToggleGroupItem
                key={item.size}
                value={item.size}
                aria-label={`Tamanho ${item.size}`}
                disabled={item.stock === 0}
              >
                {item.size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Quantidade</h3>
          <div className="flex w-[100px] items-center justify-between rounded-lg border">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Diminuir quantidade"
            >
              <MinusIcon />
            </Button>
            <p>{quantity}</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((value) => value + 1)}
              aria-label="Aumentar quantidade"
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        disabled={
          !selectedCustomer ||
          !selectedSize ||
          !sizes.some((item) => item.size === selectedSize && item.stock > 0) ||
          addToCartMutation.isPending
        }
        onClick={() => {
          if (selectedCustomer) {
            addToCartMutation.mutate(selectedCustomer.id);
          }
        }}
      >
        Adicionar à venda
      </Button>
    </div>
  );
};

export default PdvProductActions;
