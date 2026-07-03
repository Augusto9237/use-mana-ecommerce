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

interface ProductFiltersProps {
  categories: { id: string; name: string }[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");

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

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setCategory("all");
    router.push(pathname);
  };

  const hasFilters = searchParams.has("search") || searchParams.has("category");

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou descrição..."
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
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
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
