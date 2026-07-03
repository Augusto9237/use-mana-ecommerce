"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function VariantFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [stock, setStock] = useState(searchParams.get("stock") || "all");

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (search === currentSearch) return;

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, pathname, router, searchParams]);

  const handleStockChange = (value: string) => {
    setStock(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("stock", value);
    } else {
      params.delete("stock");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStock("all");
    router.push(pathname);
  };

  const hasFilters = searchParams.has("search") || searchParams.has("stock");

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, cor, tamanho ou slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex w-full md:w-auto gap-3 items-center">
        <Select value={stock} onValueChange={handleStockChange}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filtrar por estoque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="in-stock">Em estoque</SelectItem>
            <SelectItem value="out-of-stock">Sem estoque</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={handleClear} className="gap-1">
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
