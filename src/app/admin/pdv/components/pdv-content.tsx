"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  SlidersHorizontal,
  Search,
  ArrowRight,
  Shirt,
  Sparkles,
  Tag,
  Dumbbell,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { categoryTable, productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import PdvProductCard from "./pdv-product-card";
import PdvCartItem, { type PdvCartItemData } from "./pdv-cart-item";

type ProductWithVariants = typeof productTable.$inferSelect & {
  variants: (typeof productVariantTable.$inferSelect)[];
};

interface PdvContentProps {
  products: (ProductWithVariants & {
    category: typeof categoryTable.$inferSelect | null;
  })[];
  categories: (typeof categoryTable.$inferSelect)[];
}

const PdvContent = ({ products, categories }: PdvContentProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<PdvCartItemData[]>([]);

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
      const firstVariant = product.variants[0];
      if (!firstVariant) return;

      const firstSize = firstVariant.sizeInStock[0];
      if (!firstSize) {
        toast.error("Produto sem estoque disponível.");
        return;
      }

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.productVariantId === firstVariant.id,
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: `${firstVariant.id}-${Date.now()}`,
            productName: product.name,
            variantName: firstVariant.name,
            variantColor: firstVariant.color,
            size: firstSize.size,
            imageUrl: firstVariant.imageUrl[0],
            priceInCents:
              firstVariant.discountPriceInCents || firstVariant.priceInCents,
            quantity: 1,
            productVariantId: firstVariant.id,
          },
        ];
      });

      toast.success(`${product.name} adicionado à venda.`);
    },
    [],
  );

  // Aumentar quantidade
  const handleIncrease = useCallback((id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  // Diminuir quantidade
  const handleDecrease = useCallback((id: string) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  // Remover item
  const handleRemove = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Produto removido da venda.");
  }, []);

  // Limpar carrinho
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    toast.success("Carrinho limpo.");
  }, []);

  // Cálculos do carrinho
  const total = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + item.priceInCents * item.quantity,
        0,
      ),
    [cartItems],
  );

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-6 overflow-hidden">
      {/* Lado esquerdo - Filtros, Grid de Produtos e Banner */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
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
            className="shrink-0 rounded-full text-muted-foreground"
            onClick={() => toast.info("Filtro de ofertas ativado.")}
          >
            <Sparkles className="mr-1.5 size-3.5 text-primary" />
            Ofertas
          </Button>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-44 pl-8 text-sm rounded-lg"
              />
            </div>
            <Button variant="outline" size="icon-sm" className="rounded-lg">
              <SlidersHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Área rolável com Grid de produtos e Banner */}
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4 pb-4 p-0.5">
            {/* Grid de produtos */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <PdvProductCard
                  key={product.id}
                  product={product}
                  isSelected={cartItems.some(
                    (item) =>
                      item.productVariantId === product.variants[0]?.id,
                  )}
                  onAdd={handleAddProduct}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Dumbbell className="size-8" />
                <p className="text-sm">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Lado direito - Carrinho de vendas */}
      <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card max-lg:w-[320px]">
        {/* Header do carrinho */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Carrinho de vendas</h2>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
              onClick={handleClearCart}
            >
              <Trash2 className="mr-1 size-3" />
              Limpar
            </Button>
          )}
        </div>

        <div className="flex h-full flex-col px-5 pb-5 pt-4 overflow-hidden">
          <div className="flex h-full max-h-full flex-col overflow-hidden">
            <ScrollArea className="h-full">
              {cartItems.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <div className="flex h-full flex-col gap-8">
                  {cartItems.map((item) => (
                    <PdvCartItem
                      key={item.id}
                      item={item}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {cartItems.length > 0 && (
            <div className="flex flex-col gap-4">
              <Separator />

              <div className="flex items-center justify-between font-medium">
                <p>Total</p>
                <p>{formatCentsToBRL(total)}</p>
              </div>

              <Button
                className="mt-5"
                onClick={() =>
                  toast.info("Funcionalidade de finalização em desenvolvimento.")
                }
              >
                Finalizar venda
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdvContent;
