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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold ">Dashboard</h1>
          <p className=" mt-2">Bem-vindo de volta, {session.user.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts.length}</div>
              <p className="text-xs text-gray-500 mt-1">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders.length}</div>
              <p className="text-xs text-gray-500 mt-1">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-gray-500 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-1">Registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/products/create">
                <Button className="w-full" variant="default">
                  + Novo Produto
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button className="w-full" variant="outline">
                  Ver Produtos
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button className="w-full" variant="outline">
                  Ver Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Bem-vindo ao painel administrativo da RD Fitness. Use o menu lateral para navegar entre as diferentes seções do painel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
