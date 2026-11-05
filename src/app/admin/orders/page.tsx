import { headers } from "next/headers";
import { eq, or, and, count, ilike } from "drizzle-orm";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminLayout } from "@/components/admin/admin-layout";
import { OrderFilters } from "./components/order-filters";
import { OrderActionsDropdown } from "./components/order-actions-dropdown";
import { formatCentsToBRL } from "@/helpers/money";

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const status = searchParams.status || "";

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  // Build filters
  const filters = [];

  if (status && ["pending", "paid", "canceled"].includes(status)) {
    filters.push(eq(orderTable.status, status as "pending" | "paid" | "canceled"));
  }

  if (search) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
    if (isUuid) {
      filters.push(eq(orderTable.id, search));
    } else {
      filters.push(
        or(
          ilike(orderTable.recipientName, `%${search}%`),
          ilike(orderTable.email, `%${search}%`)
        )
      );
    }
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // Get total count
  const [{ count: totalOrders }] = await db
    .select({ count: count() })
    .from(orderTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalOrders / limit);

  // Fetch orders with relations
  const orders = await db.query.orderTable.findMany({
    where: whereClause,
    limit,
    offset,
    with: {
      user: true,
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const getPaginationHref = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", page.toString());
    return `/admin/orders?${params.toString()}`;
  };

  const getStatusBadge = (orderStatus: typeof orderTable.$inferSelect.status) => {
    switch (orderStatus) {
      case "paid":
        return (
          <Badge variant="outline" className="gap-1.5 px-2 text-muted-foreground">
            <CircleCheck className="size-3.5 text-emerald-600" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="gap-1.5 px-2 text-muted-foreground">
            <LoaderCircle className="size-3.5" />
            Pendente
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="gap-1.5 px-2 text-muted-foreground">
            <CircleX className="size-3.5 text-destructive" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-2 text-muted-foreground">
            {orderStatus}
          </Badge>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="flex min-w-0 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciar e acompanhar os pedidos dos clientes
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <OrderFilters />

          <div className="overflow-x-auto rounded-md border bg-background">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[140px] pl-3">Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-[190px]">Data</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[72px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground pl-3">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-foreground">
                            {order.recipientName}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {order.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderActionsDropdown order={order} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {totalOrders === 0 ? 0 : offset + 1}–
              {Math.min(offset + orders.length, totalOrders)} de {totalOrders} pedidos
            </p>
            {totalPages > 1 && (
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={getPaginationHref(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      tabIndex={currentPage === 1 ? -1 : undefined}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={`${page}-${index}`}>
                      {page === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href={getPaginationHref(Number(page))}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={getPaginationHref(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      tabIndex={currentPage === totalPages ? -1 : undefined}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
