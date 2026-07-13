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
import { CreatePromotionForm } from "./create-promotion-form";
import { deletePromotion } from "@/actions/delete-promotion";

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface PromotionsActionsDropdownProps {
  promotion: Promotion;
}

export function PromotionsActionsDropdown({
  promotion,
}: PromotionsActionsDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePromotion(promotion.id);
      toast.success("Promoção excluída com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao excluir promoção";
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
            <CreatePromotionForm
              promotion={promotion}
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
            <AlertDialogTitle>Excluir promoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a promoção{" "}
              <span className="font-semibold text-foreground">{promotion.title}</span>?
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
