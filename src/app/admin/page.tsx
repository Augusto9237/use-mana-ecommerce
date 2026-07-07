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
import { Boxes, DollarSign, ReceiptText, Users } from "lucide-react";

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
  //   if (user.role !== "admin") {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
  //           <p className="text-gray-600 mb-6">
  //             Apenas administradores podem acessar esta página
  //           </p>
  //           <Link href="/">
  //             <Button>Voltar para Home</Button>
  //           </Link>
  //         </div>
  //       </div>
  //     );
  //   }

  const [usersCountResult] = await db.select({ count: count() }).from(userTable);

  const totalProducts = await db.query.productTable.findMany();
  const totalOrders = await db.query.orderTable.findMany({
    with: {
      items: {
        with: {
          productVariant: {
            columns: {
              id: true,
              name: true,
              imageUrl: true,
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

  type VariantStat = { productName: string; variantName: string; imageUrl: string; count: number; orderCount: number };
  const variantStats = new Map<string, VariantStat>();

  for (const { items } of totalOrders) {
    const seenInOrder = new Set<string>();

    for (const { productVariant: v, quantity } of items) {
      if (!v) continue;

      const stat = variantStats.get(v.id) ?? {
        productName: v.product?.name ?? "",
        variantName: v.name,
        imageUrl: v.imageUrl,
        count: 0,
        orderCount: 0,
      };

      stat.count += quantity;
      if (!seenInOrder.has(v.id)) {
        stat.orderCount++;
        seenInOrder.add(v.id);
      }

      variantStats.set(v.id, stat);
    }
  }

  const topProducts = [...variantStats.values()]
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10);

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
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Resumo rápido das métricas e gráficos (placeholder).</p>
                <div className="mt-4 h-48 bg-muted/40 rounded" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-6 pb-6">Nenhum pedido registrado ainda.</p>
                ) : (
                  <ol className="divide-y divide-border">
                    {topProducts.map((product, index) => (
                      <li key={`${product.productName}-${product.variantName}`} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-sm font-bold text-muted-foreground w-5 shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.variantName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.productName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">{product.variantName}</p> &middot;
                            <p className="text-xs text-muted-foreground flex gap-2">
                              {product.orderCount} {product.orderCount === 1 ? "pedido" : "pedidos"} &middot; {product.count} {product.count === 1 ? "unid." : "unids."}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
