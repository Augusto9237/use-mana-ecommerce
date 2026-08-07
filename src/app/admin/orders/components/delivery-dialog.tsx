"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock3, PackageCheck, Truck, AlertCircle, RefreshCw, Car, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateUberDeliveryStatus } from "@/actions/update-uber-delivery-status";
import { requestUberDelivery } from "@/actions/request-uber-delivery";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatCentsToBRL } from "@/helpers/money";
import { de } from "zod/v4/locales";
import { recalculateUberQuote } from "@/actions/recalculate-uber-quote";

interface DeliveryDialogProps {
    order: {
        id: string;
        street: string;
        complement: string | null;
        city: string;
        state: string;
        neighborhood: string;
        zipCode: string;
        country: string;
        phone: string;
        shippingFeeInCents: number;
        status: "pending" | "paid" | "canceled";
        uberDeliveryId?: string | null;
        uberDeliveryStatus?: string | null;
    };
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

function getUberStatusLabel(status?: string | null) {
    if (!status) {
        return "Aguardando solicitação";
    }

    const normalized = status.toLowerCase();

    if (normalized.includes("delivered") || normalized.includes("completed")) {
        return "Entregue";
    }

    if (normalized.includes("cancel")) {
        return "Cancelada";
    }

    if (normalized.includes("pending") || normalized.includes("requested") || normalized.includes("accepted")) {
        return "Pendente";
    }

    if (normalized.includes("in_progress") || normalized.includes("enroute") || normalized.includes("pickup")) {
        return "Em andamento";
    }

    return status;
}

function getUberStatusTone(status?: string | null) {
    const normalized = (status || "").toLowerCase();

    if (!status) {
        return "outline";
    }

    if (normalized.includes("delivered") || normalized.includes("completed")) {
        return "default";
    }

    if (normalized.includes("cancel")) {
        return "destructive";
    }

    if (normalized.includes("in_progress") || normalized.includes("enroute") || normalized.includes("pickup")) {
        return "default";
    }

    return "secondary";
}

function isUberDeliveryCanceled(status?: string | null) {
    return !!status && status.toLowerCase().includes("cancel");
}

export function DeliveryDialog({
    order,
    open,
    onOpenChange,
}: DeliveryDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deliveryStatus, setDeliveryStatus] = useState(order.uberDeliveryStatus ?? null);
    const [deliveryId, setDeliveryId] = useState(order.uberDeliveryId ?? null);
    const [isUberUpdating, startUberTransition] = useTransition();

    const canRequest =
        order.status === "paid" &&
        (!deliveryId || isUberDeliveryCanceled(deliveryStatus) || deliveryStatus === "already_requested");

    const statusLabel = useMemo(() => getUberStatusLabel(deliveryStatus), [deliveryStatus]);
    const statusTone = useMemo(() => getUberStatusTone(deliveryStatus), [deliveryStatus]);

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

    const handleRequest = () => {
        startTransition(async () => {
            try {
                // Se a entrega anterior foi cancelada, recalcula a cotação antes
                if (isUberDeliveryCanceled(deliveryStatus)) {
                    const quoteResult = await recalculateUberQuote(order.id);

                    if (!quoteResult || ("success" in quoteResult && !quoteResult.success)) {
                        const message = (quoteResult as any)?.message ?? "Falha ao recalcular cotação da Uber";
                        toast.error(message);
                        return;
                    }
                }

                const result = await requestUberDelivery(order.id);
                setDeliveryId(result.deliveryId);
                setDeliveryStatus(result.status);
                const msg = isUberDeliveryCanceled(deliveryStatus)
                    ? "Solicitação de reentrega enviada para a Uber"
                    : "Solicitação de entrega enviada para a Uber";
                toast.success(msg);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Erro ao solicitar entrega";
                toast.error(message);
            }
        });
    };

    const handleSync = () => {
        startTransition(async () => {

            try {
                const result = await updateUberDeliveryStatus(order.id, "sync");
                setDeliveryStatus(result.status);
                toast.success("Status da entrega sincronizado");
            } catch (error) {
                const message = error instanceof Error ? error.message : "Erro ao sincronizar status";
                toast.error(message);
            }
        });
    };

    const handleCancel = () => {
        startTransition(async () => {
            try {
                const result = await await updateUberDeliveryStatus(order.id, "cancel")
                setDeliveryStatus(result.status);
                toast.success("Entrega cancelada com sucesso");
            } catch (error) {
                const message = error instanceof Error ? error.message : "Erro ao cancelar entrega";
                toast.error(message);
            }
        });
    };

    return (
        <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="justify-start gap-2">
                    <Car className="size-4 text-muted-foreground hover:text-foreground" />
                    <span>Entrega</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 pb-6">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>
                        Entrega
                    </DialogTitle>
                    <DialogDescription>
                        Acompanhe e gerencie a entrega do pedido.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-6 px-6">
                    <div className="flex flex-col">
                        <h3 className="font-semibold tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <MapPin className="size-4" />
                            Endereço de Entrega
                        </h3>
                        <Card className="p-4 relative rounded-xl">
                            <CardContent className="space-y-2 p-0">
                                <div>
                                    <span className="font-medium text-sm">Rua:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.street}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">Numero:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.complement ? `${order.complement}` : ""}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">Bairro:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.neighborhood}, {order.city} - {order.state}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-sm">CEP:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.zipCode}
                                    </span>
                                </div>
                                <div >
                                    <span className="font-medium text-sm">Telefone:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.phone}
                                    </span>
                                </div>
                                <div >
                                    <span className="font-medium text-sm">Complemento:</span>
                                    <span className="ml-1 text-muted-foreground">
                                        {order.complement ? `${order.complement}` : "Não informado"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold tracking-wider text-muted-foreground flex items-center gap-2">
                            <Truck className="size-4" />
                            Transportadora
                        </h3>
                        <Card className="p-4 relative rounded-xl">
                            <CardContent className="space-y-4 p-0">
                                <div className="flex items-start gap-3">
                                    <div className="size-16 min-w-16 bg-black p-2 rounded-sm">
                                        <Image src="https://cdn.iconscout.com/icon/free/png-256/free-uber-icon-svg-download-png-14603753.png?f=webp&w=128" alt="Uber Flash" width={0} height={0} sizes="100vw" className="size-full object-contain" unoptimized />
                                    </div>
                                    <div className="space-y-1 w-full">
                                        <p className="text-sm font-semibold text-foreground">Uber Flash</p>
                                        {deliveryId ? (
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground">ID: {deliveryId}</p>

                                                <div className="flex items-center w-full justify-between">
                                                    <Badge variant={statusTone === "default" ? "default" : statusTone === "destructive" ? "destructive" : "outline"} className="text-xs">
                                                        {statusLabel}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatCentsToBRL(order.shippingFeeInCents)}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleSync}
                                        disabled={isPending || !deliveryId}
                                        className="absolute top-4 right-4"
                                    >
                                        <RefreshCw />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                onClick={handleCancel}
                                disabled={isPending || !deliveryId}
                            >
                                Cancelar entrega
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                onClick={handleRequest}
                                className="w-full"
                                disabled={isPending || !canRequest}
                            >
                                {isPending ? "Solicitando..." : "Solicitar entrega"}
                            </Button>


                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
