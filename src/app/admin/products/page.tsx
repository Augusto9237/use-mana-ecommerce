import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { productTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { ProductImageDialog } from "./components/product-image-dialog";
import { ProductFilters } from "./components/product-filters";
import Image from "next/image";

type UserWithRole = { role?: string };

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const limit = 10;
  const offset = (currentPage - 1) * limit;

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

  const [{ count: totalProducts }] = await db
    .select({ count: count() })
    .from(productTable);

  const filters = [];

  if (category) {
    filters.push(eq(productTable.categoryId, category));
  }

  if (search) {
    filters.push(
      or(
        ilike(productTable.name, `%${search}%`),
        ilike(productTable.description, `%${search}%`),
        ilike(productTable.slug, `%${search}%`)
      )
    );
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  const totalPagesCount = await db
    .select({ count: count() })
    .from(productTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalPagesCount[0].count / limit);

  const products = await db.query.productTable.findMany({
    where: whereClause,
    limit,
    offset,
    with: {
      category: true,
      variants: true,
    },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
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


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb e Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
                  <BreadcrumbPage className="text-primary">Produtos</BreadcrumbPage>
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

        <ProductFilters categories={categories} />

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
                    <ProductImageDialog
                      src={product.variants[0]?.imageUrl[0] || ""}
                      alt={product.name}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.slug}</TableCell>
                  <TableCell className="max-w-60 overflow-hidden text-ellipsis truncate">{product.description}</TableCell>
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

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/admin/products?page=${currentPage - 1}`}
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
                        href={`/admin/products?page=${page}`}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={`/admin/products?page=${currentPage + 1}`}
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
