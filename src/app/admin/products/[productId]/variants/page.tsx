import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { and, count, eq, gt, ilike, or } from "drizzle-orm";
import { productVariantTable } from "@/db/schema";
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
import { VariantActionsDropdown } from "../../components/variant-actions-dropdown";
import { ProductImageDialog } from "../../components/product-image-dialog";
import { VariantFilters } from "./components/variant-filters";

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

type UserWithRole = { role?: string };

export default async function AdminVariantsPage({
  params,
  searchParams,
}: AdminVariantsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
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
        ilike(productVariantTable.size, `%${search}%`),
        ilike(productVariantTable.slug, `%${search}%`)
      )
    );
  }

  if (stockFilter === "in-stock") {
    filters.push(gt(productVariantTable.stock, 0));
  } else if (stockFilter === "out-of-stock") {
    filters.push(eq(productVariantTable.stock, 0));
  }

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

        <div className="mt-6">
          <VariantFilters />
        </div>

        {totalVariants === 0 ? (
          <p className="text-gray-600 text-center">
            Nenhuma variante cadastrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="w-24">
                    <ProductImageDialog
                      src={variant.imageUrl}
                      alt={variant.name}
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
                  <TableCell>{variant.size}</TableCell>
                  <TableCell>
                    {priceInReais(variant.priceInCents)}
                  </TableCell>
                  <TableCell>{variant.stock}</TableCell>
                  <TableCell>{variant.slug}</TableCell>
                  <TableCell>
                    {new Date(variant.createdAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </TableCell>
                  <TableCell className="w-20">
                    <VariantActionsDropdown variant={variant} />
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
                    href={`/admin/products/${resolvedParams.productId}/variants?${new URLSearchParams({
                      ...Object.fromEntries(Object.entries(resolvedSearchParams).filter(
                        ([key]) => key !== "page"
                      )),
                      page: String(currentPage - 1),
                    }).toString()}`}
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
                        href={`/admin/products/${resolvedParams.productId}/variants?${new URLSearchParams({
                          ...Object.fromEntries(Object.entries(resolvedSearchParams).filter(
                            ([key]) => key !== "page"
                          )),
                          page: String(page),
                        }).toString()}`}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={`/admin/products/${resolvedParams.productId}/variants?${new URLSearchParams({
                      ...Object.fromEntries(Object.entries(resolvedSearchParams).filter(
                        ([key]) => key !== "page"
                      )),
                      page: String(currentPage + 1),
                    }).toString()}`}
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
