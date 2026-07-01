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

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  // Debounce search input
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
      params.set("page", "1"); // Reset to page 1 on search
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, pathname, router, searchParams]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    router.push(pathname);
  };

  const hasFilters = searchParams.has("search") || searchParams.has("status");

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente, e-mail ou ID..."
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
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={handleClear} className="gap-1">
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
