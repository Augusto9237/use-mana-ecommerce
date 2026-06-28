import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
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
import { AdminLayout } from "@/components/admin/admin-layout";
import { CreateProductForm } from "@/components/admin/create-product-form";
import { ProductActionsDropdown } from "./components/product-actions-dropdown";
import Image from "next/image";

type UserWithRole = { role?: string };

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // if (!session?.user) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
  //         <p className="text-gray-600 mb-6">Você precisa estar autenticado</p>
  //         <Link href="/authentication">
  //           <Button>Fazer Login</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  // const user = session.user as UserWithRole;
  // if (user.role !== "admin") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
  //         <p className="text-gray-600 mb-6">
  //           Apenas administradores podem acessar esta página
  //         </p>
  //         <Link href="/">
  //           <Button>Voltar para Home</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  const categories = await db.query.categoryTable.findMany();

  const products = await db.query.productTable.findMany({
    with: {
      category: true,
      variants: true,
    },
  });


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
                  <BreadcrumbPage>Produtos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar todos os produtos do catálogo
            </p>
          </div>
          <CreateProductForm categories={categories} />
        </div>

        {/* Table */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-gray-600 mb-4">Nenhum produto cadastrado</p>
              <Link href="/admin/products/create">
                <Button>Criar Primeiro Produto</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Variantes</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="w-24">
                    <Image
                      src={product.variants[0]?.imageUrl || ""}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-sm"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.slug}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.variants.length}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="w-20">
                    <ProductActionsDropdown product={product} categories={categories} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminLayout>
  );
}
