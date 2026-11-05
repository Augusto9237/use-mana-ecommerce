import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { count, ilike } from "drizzle-orm";
import { categoryTable } from "@/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar categorias do catálogo de produtos
            </p>
          </div>
          <CreateCategoryForm />
        </div>

        {/* Filtros */}
        <CategoryFilters />

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead className="min-w-48">Nome</TableHead>
                <TableHead className="min-w-48">Slug</TableHead>
                <TableHead className="w-36">Criada em</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="w-24">
                      <ProductImageDialog
                        src={category.imageUrl || ""}
                        alt={category.name}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(category.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryActionsDropdown category={category} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search
                      ? "Nenhuma categoria encontrada com esse filtro."
                      : "Nenhuma categoria cadastrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {totalCategories === 0 ? 0 : offset + 1}–
            {Math.min(offset + categories.length, totalCategories)} de {totalCategories} categorias
          </p>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={paginationHref(currentPage - 1)}
                    text="Anterior"
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={paginationHref(Number(page))}
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
