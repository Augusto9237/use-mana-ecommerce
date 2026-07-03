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
import { CreateProductVariantForm } from "@/components/admin/create-product-variant-form";
import { deleteProductVariant } from "@/actions/delete-product-variant";

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
  stock: number;
}

interface VariantActionsDropdownProps {
  variant: Variant;
}

export function VariantActionsDropdown({
  variant,
}: VariantActionsDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteProductVariant(variant.id);
      toast.success("Variante excluída com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir variante";
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
            <CreateProductVariantForm productId={variant.productId} variant={variant} trigger={<Button variant="ghost" className="w-full justify-start gap-2"><Pencil />Editar</Button>} />
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
            <AlertDialogTitle>Excluir variante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a variante{" "}
              <span className="font-semibold text-foreground">{variant.name}</span>?
            </AlertDialogDescription>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
