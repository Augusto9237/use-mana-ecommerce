"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  Hash,
  MapPin,
  Package,
  Phone,
  User,
  Mail,
  Eye,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCentsToBRL } from "@/helpers/money";
import { updateOrderStatus } from "@/actions/update-order-status";
import { updateUberDeliveryStatus } from "@/actions/update-uber-delivery-status";

interface OrderDetailsDialogProps {
  order: {
    id: string;
    userId: string;
    recipientName: string;
    street: string;
    number: string;
    complement: string | null;
    city: string;
    state: string;
    neighborhood: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    cpfOrCnpj: string;
    totalPriceInCents: number;
    shippingFeeInCents: number;
    status: "pending" | "paid" | "canceled";
    uberDeliveryId?: string | null;
    uberDeliveryStatus?: string | null;
    createdAt: Date;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      id: string;
      quantity: number;
      priceInCents: number;
      productVariant: {
        id: string;
        name: string;
        imageUrl: string;
        priceInCents: number;
        product: {
          name: string;
        };
      };
    }>;
  };
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUberUpdating, startUberTransition] = useTransition();

  const handleStatusChange = (newStatus: "pending" | "paid" | "canceled") => {
    startTransition(async () => {
      try {
        await updateOrderStatus({
          orderId: order.id,
          status: newStatus,
        });
        toast.success("Status do pedido atualizado com sucesso!");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar status";
        toast.error(message);
      }
    });
  };

  const handleUberAction = (action: "sync" | "cancel") => {
    startUberTransition(async () => {
      try {
        await updateUberDeliveryStatus(order.id, action);
        toast.success(
          action === "cancel"
            ? "Entrega Uber cancelada com sucesso!"
            : "Status da entrega Uber sincronizado com sucesso!"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar entrega Uber";
        toast.error(message);
      }
    });
  };

  const getStatusBadge = (status: typeof order.status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Aguardando pagamento</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Eye className="size-4 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Ver Detalhes</span>
        </Button>
      </DialogTrigger>
      <DialogContent style={{ maxWidth: '600px' }} className="h-[90vh] max-h-[90vh] flex flex-col p-0 pb-6 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Hash className="size-5 text-muted-foreground" />
                <span>Pedido</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5" />
                Realizado em {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          <div className="flex flex-col gap-6">
            {/* Top: Cliente e Endereço */}
            <div className="flex flex-col gap-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="font-semibold tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <User className="size-4" />
                  Informações do Cliente
                </h3>
                <div className="bg-muted/30 p-4 rounded-xl border border-muted/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.recipientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-mail</p>
                      <p className="text-sm font-medium text-foreground break-all">
                        {order.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">CPF / CNPJ</p>
                      <p className="text-sm font-medium text-foreground">
                        {order.cpfOrCnpj}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div>
                <h3 className="font-semibold tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <MapPin className="size-4" />
                  Endereço de Entrega
                </h3>
                <div className="bg-muted/30 p-4 rounded-xl border border-muted/50 space-y-2.5 text-sm">
                  <p className="font-medium text-foreground">
                    {order.recipientName}
                  </p>
                  <p className="text-muted-foreground">
                    {order.street}, Nº {order.number}
                    {order.complement && ` - ${order.complement}`}
                  </p>
                  <p className="text-muted-foreground">
                    {order.neighborhood}
                  </p>
                  <p className="text-muted-foreground">
                    {order.city} - {order.state}
                  </p>
                  <p className="text-muted-foreground font-mono">
                    CEP: {order.zipCode}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Middle: Itens do Pedido */}
            <div>
              <h3 className="font-semibold tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Package className="size-4" />
                Itens do Pedido
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 bg-muted/30 p-3 rounded-xl border border-muted"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-14 rounded-md overflow-hidden bg-white border flex-shrink-0">
                        <Image
                          src={item.productVariant.imageUrl}
                          alt={item.productVariant.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {item.productVariant.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          Tamanho/Cor: {item.productVariant.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qtd: {item.quantity} × {formatCentsToBRL(item.priceInCents)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-right flex-shrink-0">
                      {formatCentsToBRL(item.priceInCents * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {order.uberDeliveryId && (
              <div className="rounded-xl border border-muted/50 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Entrega Uber</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {order.uberDeliveryId}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {order.uberDeliveryStatus || "Sem status"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUberAction("sync")}
                    disabled={isUberUpdating}
                  >
                    {isUberUpdating ? "Sincronizando..." : "Sincronizar status"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUberAction("cancel")}
                    disabled={isUberUpdating}
                  >
                    Cancelar entrega
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-card p-4 rounded-xl space-y-2.5 border border-muted/50 w-full">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCentsToBRL(order.totalPriceInCents - order.shippingFeeInCents)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Frete</span>
                <span className="text-emerald-600 font-medium">{formatCentsToBRL(order.shippingFeeInCents)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span className="text-lg">
                  {formatCentsToBRL(order.totalPriceInCents)}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
