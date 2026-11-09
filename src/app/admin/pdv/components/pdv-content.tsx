"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Search, Sparkles, Dumbbell } from "lucide-react";
import { toast } from "sonner";

import { addProductToPdvCart } from "@/actions/add-cart-product";
import { categoryTable, productTable, productVariantTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { getUsePdvCartQueryKey, usePdvCart } from "@/hooks/queries/use-cart";

import PdvProductCard from "./pdv-product-card";
import PdvCart from "./pdv-cart";
import SearchCustomers, { type PdvCustomer } from "./search-customers";

type ProductWithVariants = typeof productTable.$inferSelect & {
  variants: (typeof productVariantTable.$inferSelect)[];
};

interface PdvContentProps {
  products: (ProductWithVariants & {
    category: typeof categoryTable.$inferSelect | null;
  })[];
  categories: (typeof categoryTable.$inferSelect)[];
  customers: PdvCustomer[];
}

const PdvContent = ({ products, categories, customers }: PdvContentProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<PdvCustomer | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { data: cart } = usePdvCart(selectedCustomer?.id);
  const addToCartMutation = useMutation({
    mutationFn: async (data: {
      productVariantId: string;
      size: string;
      quantity: number;
      userId: string;
    }) => {
      const { userId, ...productData } = data;
      const result = await addProductToPdvCart(productData, userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: getUsePdvCartQueryKey(variables.userId),
      });
    },
  });

  // Filtrar produtos por categoria e busca
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Adicionar produto ao carrinho do PDV
  const handleAddProduct = useCallback(
    (product: ProductWithVariants) => {
      if (!selectedCustomer) {
        toast.error("Selecione um cliente antes de adicionar produtos.");
        return;
      }

      const firstVariant = product.variants[0];
      if (!firstVariant) return;

      const firstSize = firstVariant.sizeInStock[0];
      if (!firstSize) {
        toast.error("Produto sem estoque disponível.");
        return;
      }

      addToCartMutation.mutate(
        {
          productVariantId: firstVariant.id,
          size: firstSize.size,
          quantity: 1,
          userId: selectedCustomer.id,
        },
        {
          onSuccess: () => toast.success(`${product.name} adicionado à venda.`),
          onError: (error) => toast.error(error.message),
        },
      );
    },
    [addToCartMutation, selectedCustomer],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold max-sm:text-xl">Ponto de Venda</h1>
          <p className="text-muted-foreground text-sm">
            Registrar vendas presenciais de forma rápida e intuitiva
          </p>
        </div>
        <SearchCustomers
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={(customer) => {
            setSelectedCustomer(customer);
            toast.success(`${customer.name} selecionado para a venda.`);
          }}
        />
      </header>

      <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
        {/* Lado esquerdo - Filtros, Grid de Produtos e Banner */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg pl-8 text-sm"
            />
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <Button
              variant={selectedCategory === null ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>

            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground shrink-0 rounded-full"
              onClick={() => toast.info("Filtro de ofertas ativado.")}
            >
              <Sparkles className="text-primary mr-1.5 size-3.5" />
              Ofertas
            </Button>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button variant="outline" size="icon-sm" className="rounded-lg">
                <SlidersHorizontal className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Área rolável com Grid de produtos e Banner */}
          <ScrollArea className="flex-1 pr-3">
            <div className="space-y-4 p-0.5 pb-4">
              {/* Grid de produtos */}
              <div className="flex flex-wrap gap-4">
                {filteredProducts.map((product) => (
                  <PdvProductCard
                    key={product.id}
                    product={product}
                    isSelected={cart?.items.some(
                      (item) =>
                        item.productVariantId === product.variants[0]?.id,
                    )}
                    onAdd={handleAddProduct}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2">
                  <Dumbbell className="size-8" />
                  <p className="text-sm">Nenhum produto encontrado.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <PdvCart selectedCustomer={selectedCustomer} />
      </div>
    </div>
  );
};

export default PdvContent;
