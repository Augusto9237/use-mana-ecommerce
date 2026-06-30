"use client";

import { useState } from "react";
import { EllipsisVertical, Pencil, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { deleteCategory } from "@/actions/delete-category";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

interface CategoryActionsDropdownProps {
  category: Category;
}

export function CategoryActionsDropdown({
  category,
}: CategoryActionsDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir categoria";
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
            <CreateCategoryForm
              category={category}
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
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria{" "}
              <span className="font-semibold text-foreground">{category.name}</span>?
            </AlertDialogDescription>
            <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
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
