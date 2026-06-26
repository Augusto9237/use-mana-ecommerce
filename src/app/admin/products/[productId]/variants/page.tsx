import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CreateProductVariantForm } from "@/components/admin/create-product-variant-form";
import { AdminLayout } from "@/components/admin/admin-layout";

interface AdminVariantsPageProps {
  params: {
    productId: string;
  };
}

type UserWithRole = { role?: string };

export default async function AdminVariantsPage({
  params,
}: AdminVariantsPageProps) {
  const resolvedParams = await params;
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

  const product = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.id, resolvedParams.productId),
    with: {
      variants: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const priceInReais = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                  <BreadcrumbLink asChild>
                    <Link href="/admin/products">Produtos</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Variantes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-2xl font-bold">
              Variantes: {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie as variantes deste produto</p>

          </div>
          <CreateProductVariantForm productId={product.id} />
        </div>

        <Card>
          <CardContent>
            {product.variants.length === 0 ? (
              <p className="text-gray-600 text-center">
                Nenhuma variante cadastrada
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Criada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <Image
                          src={variant.imageUrl}
                          alt={variant.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {variant.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: variant.color,
                            }}
                          />
                          {variant.color}
                        </div>
                      </TableCell>
                      <TableCell>
                        {priceInReais(variant.priceInCents)}
                      </TableCell>
                      <TableCell>{variant.slug}</TableCell>
                      <TableCell>
                        {new Date(variant.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
