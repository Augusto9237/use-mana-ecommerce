"use client";

import { useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Home, Package, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { PdvReceipt, type PdvReceiptData } from "./pdv-receipt";

interface PdvReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PdvReceiptData | null;
  onNewSale?: () => void;
}

export function PdvReceiptDialog({
  open,
  onOpenChange,
  data,
  onNewSale,
}: PdvReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Estilos específicos para impressão */}
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
              }
            }
          `,
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[92dvh] flex flex-col p-4 sm:p-6 print:hidden">
          <DialogHeader className="text-center sm:text-center pb-2">
            <div className="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Venda Concluída com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pedido #{data.orderId.slice(0, 8).toUpperCase()} registrado no
              sistema.
            </DialogDescription>
          </DialogHeader>

          {/* Área de visualização do cupom */}
          <div className="flex-1 min-h-0 bg-muted/30 p-2 sm:p-3 rounded-lg border">
            <ScrollArea className="max-h-[50vh] pr-1">
              <PdvReceipt ref={receiptRef} data={data} />
            </ScrollArea>
          </div>

          {/* Ações */}
          <div className="pt-4 space-y-2 border-t">
            <Button
              size="lg"
              className="w-full font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handlePrint}
            >
              <Printer className="size-4" />
              Imprimir Comprovante
            </Button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={onNewSale}
                asChild
              >
                <Link href="/admin/pdv">
                  <Home className="mr-1.5 size-3.5" />
                  Nova Venda
                </Link>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                asChild
              >
                <Link href="/admin/orders">
                  <Package className="mr-1.5 size-3.5" />
                  Ver Pedidos
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

