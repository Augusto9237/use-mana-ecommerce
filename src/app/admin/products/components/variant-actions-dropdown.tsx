"use client";

import { useState } from "react";
import Link from "next/link";
import { BoxesIcon, EllipsisVertical, Pencil, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateProductForm } from "@/components/admin/create-product-form";
import { deleteProduct } from "@/actions/delete-product";

interface Variant {
  id: string;
  name: string;
  createdAt: Date;
  slug: string;
  imageUrl: string;
  productId: string;
  color: string;
  size: string;
  priceInCents: number;
}

interface VariantActionsDropdownProps {
  variant: Variant;
}

export function VariantActionsDropdown({
  variant,
}: VariantActionsDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // async function handleDelete() {
  //   setIsDeleting(true);
  //   try {
  //     await deleteProduct(product.id);
  //     toast.success("Produto excluído com sucesso!");
  //   } catch (error) {
  //     const message =
  //       error instanceof Error ? error.message : "Erro ao excluir produto";
  //     toast.error(message);
  //   } finally {
  //     setIsDeleting(false);
  //     setConfirmOpen(false);
  //   }
  // }

  return (
    <>
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
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Pencil />
              Editar
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant="destructive"
              className="w-full gap-2 justify-start"
              onClick={() => setConfirmOpen(true)}
            >
              <TrashIcon />
              Excluir
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-semibold text-foreground">{variant.name}</span>?
            </AlertDialogDescription>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita e todas as variantes associadas também serão removidas.</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              // onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
