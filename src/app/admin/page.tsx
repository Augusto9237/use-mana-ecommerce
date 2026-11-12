import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userTable } from "@/db/schema";
import { count } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import Image from "next/image";
import { formatCentsToBRL } from "@/helpers/money";
import { Boxes, CircleCheck, CircleX, DollarSign, LoaderCircle, ReceiptText, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderActionsDropdown } from "./orders/components/order-actions-dropdown";

type UserWithRole = { role?: string };

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado</p>
          <Link href="/authentication">
            <Button>Fazer Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user as UserWithRole;
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">
            Apenas administradores podem acessar esta página
          </p>
          <Link href="/">
            <Button>Voltar para Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const [usersCountResult] = await db.select({ count: count() }).from(userTable);

  const totalProducts = await db.query.productTable.findMany();
  const totalOrders = await db.query.orderTable.findMany({
    with: {
      user: true,
      items: {
        with: {
          productVariant: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
              priceInCents: true,
            },
            with: {
              product: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const totalRevenue = totalOrders.reduce((sum, order) => sum + order.totalPriceInCents, 0);

  type VariantStat = { productName: string; variantName: string; imageUrl: string; count: number; orderCount: number; priceInCents: number };
  const variantStats = new Map<string, VariantStat>();

  for (const { items } of totalOrders) {
    const seenInOrder = new Set<string>();

    for (const { productVariant: v, quantity } of items) {
      if (!v) continue;

      const stat = variantStats.get(v.id) ?? {
        productName: v.product?.name ?? "",
        variantName: v.name,
        imageUrl: Array.isArray(v.imageUrl) ? v.imageUrl[0] ?? "" : v.imageUrl ?? "",
        count: 0,
        orderCount: 0,
        priceInCents: v.priceInCents,
      };

      stat.count += quantity;
      if (!seenInOrder.has(v.id)) {
        stat.orderCount++;
        seenInOrder.add(v.id);
      }

      variantStats.set(v.id, stat);
    }
  }

  const latestOrders = [...totalOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const topProducts = [...variantStats.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const getStatusBadge = (orderStatus: typeof totalOrders[number]["status"]) => {
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo de volta, {session.user.name}!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-muted-foreground/10 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs">
          <Card className="@container/card relative">
            <CardHeader>
              <CardTitle className="text-sm">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="absolute top-6 right-6">
                <Boxes className="text-3xl font-extrabold stroke-primary" />
              </span>
              <div className="text-3xl font-extrabold">{totalProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="@container/card relative">
            <CardHeader>
              <CardTitle className="text-sm">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="absolute top-6 right-6">
                <ReceiptText className="text-3xl font-extrabold stroke-primary" />
              </span>
              <div className="text-3xl font-extrabold">{totalOrders.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card className="@container/card relative">
            <CardHeader>
              <CardTitle className="text-sm">Receita (Este mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="absolute top-6 right-6">
                <DollarSign className="text-3xl font-extrabold stroke-primary" />
              </span>
              <div className="text-3xl font-extrabold">{formatCentsToBRL(totalRevenue)}</div>
              <p className="text-sm text-muted-foreground mt-1">Estimativa</p>
            </CardContent>
          </Card>

          <Card className="@container/card relative">
            <CardHeader>
              <CardTitle className="text-sm">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="absolute top-6 right-6">
                <Users className="text-3xl font-extrabold stroke-primary" />
              </span>
              <div className="text-3xl font-extrabold">{usersCountResult?.count ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">Registrados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Últimos Pedidos</CardTitle>

                <Link href={"/admin/orders"}>
                  <span className="text-sm text-muted-foreground hover:underline hover:text-foreground">Ver todos</span>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[140px] pl-3">Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="w-[190px]">Data</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[72px] text-right pr-4">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestOrders.length > 0 ? (
                        latestOrders.map((order) => (
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
                            <TableCell className="justify-end items-end text-right pr-4 flex">
                              <OrderActionsDropdown order={order as any} />
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0 px-6 gap-3 flex flex-col">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-6 pb-6">Nenhum pedido registrado ainda.</p>
                ) : (
                  <>
                    {topProducts.map((product, index) => (
                      <Card key={`${product.productName}-${product.variantName}`} className="flex flex-row items-center gap-3 p-3 rounded-xl">
                        <span className="text-sm font-bold text-muted-foreground w-5 shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.variantName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">{product.productName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground truncate">{product.variantName}</p> &middot;
                              <p className="text-xs text-muted-foreground flex gap-2">
                                x{product.count}
                              </p> &middot;
                              <p className="text-xs text-muted-foreground flex gap-2">
                                {formatCentsToBRL(product.priceInCents)}
                              </p>
                            </div>

                          </div>
                          <p className="text-sm font-medium truncate">{formatCentsToBRL(product.priceInCents * product.count)}</p>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
