import { headers } from "next/headers";
import Link from "next/link";
import { eq, or, and, count, ilike } from "drizzle-orm";
import { Eye } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { OrderDetailsDialog } from "./components/order-details-dialog";
import { formatCentsToBRL } from "@/helpers/money";

type UserWithRole = { role?: string };

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const status = searchParams.status || "";

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Pendente</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{orderStatus}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb e Header */}
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary">Pedidos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar e acompanhar os pedidos dos clientes
            </p>
          </div>
        </div>

        {/* Filtros */}
        <OrderFilters />

        {/* Tabela de Pedidos */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Pedido ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {order.recipientName}
                        </span>
                        <span className="text-xs text-muted-foreground">
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
                    <TableCell className="text-right font-semibold">
                      {formatCentsToBRL(order.totalPriceInCents)}
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderDetailsDialog order={order} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
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
                  <PaginationItem key={index}>
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
