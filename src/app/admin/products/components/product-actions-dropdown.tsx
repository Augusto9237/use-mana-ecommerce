"use client";

import Link from "next/link";
import { BoxesIcon, EllipsisVertical, PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductActionsDropdownProps {
  productId: string;
}

export function ProductActionsDropdown({
  productId,
}: ProductActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <EllipsisVertical />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}/variants`} className="flex items-center gap-2">
          <BoxesIcon />
            Variantes
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}/variants`} className="flex items-center gap-2">
          <PencilIcon />
            Editar
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${productId}/variants`} className="flex items-center gap-2 text-destructive">
          <TrashIcon />
            Excluir
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
