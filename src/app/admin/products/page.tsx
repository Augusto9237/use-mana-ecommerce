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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminLayout } from "@/components/admin/admin-layout";
import { CreateProductForm } from "@/components/admin/create-product-form";
import { ProductActionsDropdown } from "./components/product-actions-dropdown";
import { ProductImageDialog } from "./components/product-image-dialog";
import { ProductFilters } from "./components/product-filters";

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

  const categories = await db.query.categoryTable.findMany();

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

  const [{ count: filteredProducts }] = await db
    .select({ count: count() })
    .from(productTable)
    .where(whereClause);

  const totalPages = Math.ceil(filteredProducts / limit);

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

  const getPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("page", page.toString());
    return `/admin/products?${params.toString()}`;
  };


  return (
    <AdminLayout>
      <div className="flex min-w-0 flex-col gap-6">
        {/* Breadcrumb e Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar todos os produtos do catálogo
            </p>
          </div>
          <CreateProductForm categories={categories} />
        </div>

        <ProductFilters categories={categories} />

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead className="min-w-40">Nome</TableHead>
                <TableHead className="min-w-40">Slug</TableHead>
                <TableHead className="min-w-48">Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-24">Variantes</TableHead>
                <TableHead className="w-32">Criado em</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="w-24">
                      <ProductImageDialog
                        src={product.variants[0]?.imageUrl[0] || ""}
                        alt={product.name}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.slug}
                    </TableCell>
                    <TableCell className="max-w-60 truncate text-muted-foreground">
                      {product.description}
                    </TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        {product.variants.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActionsDropdown
                        product={product}
                        categories={categories}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span>
                        {search || category
                          ? "Nenhum produto encontrado com esses filtros."
                          : "Nenhum produto cadastrado."}
                      </span>
                      {!search && !category && (
                        <Button asChild size="sm">
                          <Link href="/admin/products/create">
                            Criar primeiro produto
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredProducts === 0 ? 0 : offset + 1}–
            {Math.min(offset + products.length, filteredProducts)} de {filteredProducts} produtos
          </p>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={getPageHref(currentPage - 1)}
                    text="Anterior"
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
                        href={getPageHref(Number(page))}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={getPageHref(currentPage + 1)}
                    text="Próxima"
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
    </AdminLayout>
  );
}
