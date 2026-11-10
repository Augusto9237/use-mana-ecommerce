"use client";

import { Printer } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCentsToBRL } from "@/helpers/money";

import { PdvReceipt, type PdvReceiptData } from "./pdv-receipt";

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  money: "Dinheiro",
};

interface PdvPrintAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PdvReceiptData | null;
  onConfirmPrint: () => void;
  onSkipPrint: () => void;
}

export function PdvPrintAlertDialog({
  open,
  onOpenChange,
  data,
  onConfirmPrint,
  onSkipPrint,
}: PdvPrintAlertDialogProps) {
  if (!data) return null;

  const totalQuantity = data.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <>
      {/* Estilos para impressão do comprovante */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                margin: 4mm;
                size: auto;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              body * {
                visibility: hidden !important;
              }
              #pdv-thermal-receipt,
              #pdv-thermal-receipt * {
                visibility: visible !important;
              }
              #pdv-thermal-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 4mm !important;
                background: #ffffff !important;
                color: #000000 !important;
                border: none !important;
                box-shadow: none !important;
                font-size: 11px !important;
                display: block !important;
              }
            }
          `,
        }}
      />

      {/* Elemento de impressão garantido no DOM para window.print() */}
      <div className="hidden print:block">
        <PdvReceipt data={data} />
      </div>

      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent size="default" className="sm:max-w-md print:hidden">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/10 text-primary">
              <Printer className="size-8" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-xl font-bold">
              Venda Concluída! Deseja imprimir o comprovante?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              O pedido{" "}
              <strong className="text-foreground">
                #{data.orderId.slice(0, 8).toUpperCase()}
              </strong>{" "}
              foi registrado com sucesso para{" "}
              <strong className="text-foreground">{data.customer.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Resumo da venda */}
          <div className="rounded-lg border bg-muted/40 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor Total:</span>
              <span className="font-extrabold text-sm text-foreground">
                {formatCentsToBRL(data.totalInCents)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Forma de Pagamento:</span>
              <span className="font-semibold text-foreground">
                {paymentMethodLabels[data.paymentMethod] || data.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Modalidade:</span>
              <span className="font-medium text-foreground">
                {data.deliveryType === "pickup"
                  ? "Retirada no Balcão"
                  : "Entrega no Endereço"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Itens:</span>
              <span className="font-medium text-foreground">
                {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
              </span>
            </div>
          </div>

          <AlertDialogFooter className="mt-2 sm:justify-end gap-2">
            <AlertDialogCancel
              onClick={onSkipPrint}
              className="w-full sm:w-auto"
            >
              Não imprimir
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmPrint}
              className="w-full sm:w-auto font-semibold gap-1.5"
            >
              <Printer className="size-4" />
              Sim, imprimir comprovante
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

