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

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  slug: string;
}

interface ProductActionsDropdownProps {
  product: Product;
  categories: Category[];
}

export function ProductActionsDropdown({
  product,
  categories,
}: ProductActionsDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir produto";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  }

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
            <Link href={`/admin/products/${product.id}/variants`} className="flex items-center gap-2">
              <BoxesIcon />
              Variantes
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <CreateProductForm
              product={product}
              categories={categories}
              trigger={
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Pencil />
                  Editar
                </Button>
              }
            />
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
              <span className="font-semibold text-foreground">{product.name}</span>?
            </AlertDialogDescription>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita e todas as variantes associadas também serão removidas.</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
