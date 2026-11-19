"use client";

import { Car, MapPin, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";

interface DeliveryDialogProps {
  order: {
    street: string | null;
    complement: string | null;
    number: string | null;
    city: string | null;
    state: string | null;
    neighborhood: string | null;
    zipCode: string | null;
    country: string | null;
    phone: string | null;
    shippingFeeInCents: number;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeliveryDialog({ order }: DeliveryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="justify-start gap-2">
          <Car className="size-4 text-muted-foreground" />
          <span>Entrega</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrega</DialogTitle>
          <DialogDescription>Dados de entrega e frete tabelado.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <MapPin className="size-4" />
              Endereco de entrega
            </h3>
            <Card>
              <CardContent className="space-y-2 p-4 text-sm">
                <p>{order.street ? `${order.street}, ${order.number ?? ""}` : "Sem endereco de entrega"}</p>
                {order.complement && <p>Complemento: {order.complement}</p>}
                <p>{[order.neighborhood, order.city, order.state].filter(Boolean).join(", ") || "Nao informado"}</p>
                <p>CEP: {order.zipCode ?? "Nao informado"}</p>
                <p>Telefone: {order.phone ?? "Nao informado"}</p>
              </CardContent>
            </Card>
          </div>
          <Separator />
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Truck className="size-4" />
              Frete tabelado
            </h3>
            <Card>
              <CardContent className="p-4">
                <p className="font-medium">{formatCentsToBRL(order.shippingFeeInCents)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
