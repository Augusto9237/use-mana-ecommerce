import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProductForm } from "@/components/admin/create-product-form";
import { AdminLayout } from "@/components/admin/admin-layout";

type UserWithRole = { role?: string };

export default async function CreateProductPage() {
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

  const categories = await db.query.categoryTable.findMany();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div>
          <div className="text-sm text-gray-600 mb-4">
            <Link href="/admin" className="hover:underline">
              Dashboard
            </Link>
            {" > "}
            <Link href="/admin/products" className="hover:underline">
              Produtos
            </Link>
            {" > "}
            <span className="text-yellow-600 font-semibold">Novo produto</span>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo produto</h1>
          <p className="text-gray-600 mt-1">Cadastre um novo produto em sua loja</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateProductForm categories={categories} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
