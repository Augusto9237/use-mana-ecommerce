"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/actions/delete-order";

interface AlertDeleteOrderProps {
  order: {
    id: string;
    recipientName?: string | null;
    status: "pending" | "paid" | "canceled";
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDeleteOrder({
  order,
  trigger,
  open: externalOpen,
  onOpenChange,
}: AlertDeleteOrderProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => { })) : setInternalOpen;

  function handleDeleteOrder() {
    startTransition(async () => {
      try {
        await deleteOrder(order.id);
        toast.success("Pedido excluído com sucesso!");
        setOpen(false);
      } catch (error) {
        console.error("Erro ao excluir pedido:", error);
        const message =
          error instanceof Error ? error.message : "Erro ao excluir pedido";
        toast.error(message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <AlertDialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="destructive"
              className="w-full gap-2 justify-start cursor-pointer"
            >
              <TrashIcon className="size-4" />
              <span>Excluir</span>
            </Button>
          )}
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o pedido{" "}
            <span className="font-semibold text-foreground">
              #{order.id.slice(0, 8)}
            </span>
            {order.recipientName ? ` de ${order.recipientName}` : ""}?
          </AlertDialogDescription>
          <p className="text-xs text-muted-foreground">
            O pedido está {order.status === "paid" ? "Pago" : "Aguardando Pagamento"}
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteOrder();
            }}
            disabled={isPending}
            variant="destructive"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
