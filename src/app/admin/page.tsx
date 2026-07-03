import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";

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

  const totalProducts = await db.query.productTable.findMany();
  const totalOrders = await db.query.orderTable.findMany();
  
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
          <Card className="@container/card">
            <CardHeader>
              <CardTitle className="text-sm">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{totalProducts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardTitle className="text-sm">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{totalOrders.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardTitle className="text-sm">Receita (Este mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">R$ 0,00</div>
              <p className="text-sm text-muted-foreground mt-1">Estimativa</p>
            </CardContent>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardTitle className="text-sm">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">0</div>
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

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/products/create">
                  <Button className="w-full">Criar Produto</Button>
                </Link>
                <Link href="/admin/products">
                  <Button className="w-full" variant="outline">Gerenciar Produtos</Button>
                </Link>
                <Link href="/admin/orders">
                  <Button className="w-full" variant="ghost">Ver Pedidos</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
