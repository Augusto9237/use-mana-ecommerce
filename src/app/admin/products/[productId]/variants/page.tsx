import { notFound } from "next/navigation";

import { db } from "@/db";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { productVariantTable } from "@/db/schema";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateProductVariantForm } from "@/components/admin/create-product-variant-form";
import { AdminLayout } from "@/components/admin/admin-layout";
import { VariantActionsDropdown } from "../../components/variant-actions-dropdown";
import { ProductImageDialog } from "../../components/product-image-dialog";
import { VariantFilters } from "./components/variant-filters";
import { formatCentsToBRL } from "@/helpers/money";

interface AdminVariantsPageProps {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    stock?: string;
  }>;
}

export default async function AdminVariantsPage({
  params,
  searchParams,
}: AdminVariantsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const product = await db.query.productTable.findFirst({
    where: (product, { eq }) => eq(product.id, resolvedParams.productId),
    with: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const search = resolvedSearchParams.search || "";
  const stockFilter = resolvedSearchParams.stock || "";

  const filters: any[] = [
    eq(productVariantTable.productId, resolvedParams.productId),
  ];

  if (search) {
    filters.push(
      or(
        ilike(productVariantTable.name, `%${search}%`),
        ilike(productVariantTable.color, `%${search}%`),
        ilike(productVariantTable.slug, `%${search}%`)
      )
    );
  }

  // Nota: filtro de stock baseado em sizeInStock (JSONB) seria complexo,
  // considerando implementar se necessário com SQL raw

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [{ count: totalVariants }] = await db
    .select({ count: count() })
    .from(productVariantTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalVariants / limit);

  const variants = await db.query.productVariantTable.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (variant, { desc }) => [desc(variant.createdAt)],
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
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (key !== "page" && value) params.set(key, value);
    }
    params.set("page", String(page));
    return `/admin/products/${resolvedParams.productId}/variants?${params.toString()}`;
  };


  return (
    <AdminLayout>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Variantes: {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as variantes deste produto
            </p>
          </div>
          <CreateProductVariantForm productId={product.id} />
        </div>

        <VariantFilters />

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[1080px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead className="min-w-36">Slug</TableHead>
                <TableHead className="min-w-28">Cor</TableHead>
                <TableHead className="min-w-36">Tamanho</TableHead>
                <TableHead className="w-32 text-right">Custo</TableHead>
                <TableHead className="w-32 text-right">Preço</TableHead>
                <TableHead className="w-36 text-right">Preço promocional</TableHead>
                <TableHead className="w-24 text-right">Estoque</TableHead>
                <TableHead className="w-32">Criada em</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.length > 0 ? (
                variants.map((variant) => {
                  const stock = Array.isArray(variant.sizeInStock)
                    ? variant.sizeInStock.reduce(
                        (total, size) => total + size.stock,
                        0
                      )
                    : 0;

                  return (
                    <TableRow key={variant.id}>
                      <TableCell className="w-24">
                        <ProductImageDialog
                          src={variant.imageUrl?.[0] ?? ""}
                          alt={variant.name}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {variant.slug}
                      </TableCell>
                      <TableCell>{variant.color}</TableCell>
                      <TableCell className="max-w-36 text-sm text-muted-foreground">
                        {Array.isArray(variant.sizeInStock)
                          ? variant.sizeInStock.map((size) => size.size).join(", ")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCentsToBRL(variant.costInCents)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCentsToBRL(variant.priceInCents)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {variant.discountPriceInCents
                          ? formatCentsToBRL(variant.discountPriceInCents)
                          : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {stock}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(variant.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <VariantActionsDropdown variant={variant} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search || stockFilter
                      ? "Nenhuma variante encontrada com esses filtros."
                      : "Nenhuma variante cadastrada para este produto."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {totalVariants === 0 ? 0 : offset + 1}–
            {Math.min(offset + variants.length, totalVariants)} de {totalVariants} variantes
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
                  <PaginationItem key={`${page}-${index}`}>
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
