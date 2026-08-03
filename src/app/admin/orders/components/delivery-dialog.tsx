"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock3, PackageCheck, Truck, AlertCircle, RefreshCw, Car } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateUberDeliveryStatus } from "@/actions/update-uber-delivery-status";
import { requestUberDelivery } from "@/actions/request-uber-delivery";
import { Card, CardContent } from "@/components/ui/card";

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

export function DeliveryDialog({
    order,
}: DeliveryDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deliveryStatus, setDeliveryStatus] = useState(order.uberDeliveryStatus ?? null);
    const [deliveryId, setDeliveryId] = useState(order.uberDeliveryId ?? null);
    const [isUberUpdating, startUberTransition] = useTransition();

    const canRequest = order.status === "paid" && !deliveryId;

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
                const result = await requestUberDelivery(order.id);
                setDeliveryId(result.deliveryId);
                setDeliveryStatus(result.status);
                toast.success("Solicitação de entrega enviada para a Uber");
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                    <Car className="size-4 text-muted-foreground hover:text-foreground" />
                    <span className="sr-only">Entrega</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Entrega
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-0.5">
                        <div>
                            <span>Rua:</span>
                            <span className="ml-1 text-muted-foreground">
                                {order.street}
                            </span>
                        </div>
                        <div>
                            <span>Numero:</span>
                            <span className="ml-1 text-muted-foreground">
                                {order.complement ? `${order.complement}` : ""}
                            </span>
                        </div>
                        <div>
                            <span>Bairro:</span>
                            <span className="ml-1 text-muted-foreground">
                                {order.neighborhood}, {order.city} - {order.state}
                            </span>
                        </div>
                        <div>
                            <span>CEP:</span>
                            <span className="ml-1 text-muted-foreground">
                                {order.zipCode}
                            </span>
                        </div>
                        <div>
                            <span>Telefone:</span>
                            <span className="ml-1 text-muted-foreground">
                                {order.phone}
                            </span>
                        </div>

                    </div>
                    <Card className="p-0 py-4">
                        <CardContent className="relative space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">Uber</p>
                                    {deliveryId ? (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">ID: {deliveryId}</p>
                                            <Badge variant={statusTone === "default" ? "default" : statusTone === "destructive" ? "destructive" : "outline"} className="text-xs">
                                                {statusLabel}
                                            </Badge>
                                        </div>
                                    ) : null}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSync}
                                    disabled={isPending || !deliveryId}
                                    className="absolute top-0 right-4"
                                >
                                    <RefreshCw />
                                </Button>
                            </div>

                            {/* {!canRequest && !deliveryId ? (
                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                <AlertCircle className="size-4" />
                                <span>Esta opção fica disponível quando o pedido estiver pago e houver uma cotação Uber válida.</span>
                            </div>
                        ) : null}

                        {deliveryId ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                                <PackageCheck className="size-4" />
                                <span>Entrega vinculada ao pedido e acompanhada pela Uber.</span>
                            </div>
                        ) : null} */}
                        </CardContent>
                    </Card>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleRequest}
                            disabled={isPending || !canRequest}
                        >
                            {isPending ? "Solicitando..." : "Solicitar entrega"}
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isPending || !deliveryId}
                        >
                            <Truck className="mr-2 size-3.5" />
                            Cancelar entrega
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
