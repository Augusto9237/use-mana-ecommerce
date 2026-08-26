"use client";

import { EllipsisVertical } from "lucide-react";
import type { InferModel } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { orderItemTable, orderTable, productTable, productVariantTable, userTable } from "@/db/schema";
import { DeliveryDialog } from "./delivery-dialog";
import { OrderDetailsDialog } from "./order-details-dialog";
import { AlertDeleteOrder } from "./alert-delete-order";

type OrderWithRelations = InferModel<typeof orderTable> & {
    user: InferModel<typeof userTable>;
    items: Array<
        InferModel<typeof orderItemTable> & {
            productVariant: InferModel<typeof productVariantTable> & {
                product: InferModel<typeof productTable>;
            };
        }
    >;
};

interface OrderActionsDropdownProps {
    order: OrderWithRelations;
}

export function OrderActionsDropdown({ order }: OrderActionsDropdownProps) {
    return (
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
            <DropdownMenuContent align="end" className="w-44 flex flex-col gap-1">
                <DropdownMenuItem asChild>
                    <OrderDetailsDialog
                        order={order}
                    />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <DeliveryDialog
                        order={order}
                    />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <AlertDeleteOrder
                        order={order}
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
