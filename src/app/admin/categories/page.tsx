import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { count, ilike } from "drizzle-orm";
import { categoryTable } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
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
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import { CategoryActionsDropdown } from "./components/category-actions-dropdown";
import { ProductImageDialog } from "../products/components/product-image-dialog";
import { CategoryFilters } from "./components/category-filters";

export default async function AdminCategoriesPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const search = searchParams.search || "";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const whereClause = search ? ilike(categoryTable.name, `%${search}%`) : undefined;

  const [{ count: totalCategories }] = await db
    .select({ count: count() })
    .from(categoryTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalCategories / limit);

  const categories = await db.query.categoryTable.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
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

  const paginationHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    if (search) params.set("search", search);
    return `/admin/categories?${params.toString()}`;
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
                  <BreadcrumbPage className="text-primary">Categorias</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl max-sm:text-xl font-bold">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar categorias do catálogo de produtos
            </p>
          </div>
          <CreateCategoryForm />
        </div>

        {/* Filtros */}
        <CategoryFilters />

        {/* Table */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
              <CreateCategoryForm />
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="w-24">
                    <ProductImageDialog
                      src={category.imageUrl || ""}
                      alt={category.name}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="w-20">
                    <CategoryActionsDropdown category={category} />
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
                    href={paginationHref(currentPage - 1)}
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
                        href={paginationHref(page as number)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={paginationHref(currentPage + 1)}
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
