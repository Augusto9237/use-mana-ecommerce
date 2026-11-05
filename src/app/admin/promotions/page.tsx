import { headers } from "next/headers";
import { CircleCheck, CircleX } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { count, ilike } from "drizzle-orm";
import { promotionTable } from "@/db/schema";
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
import { CreatePromotionForm } from "./components/create-promotion-form";
import { PromotionBannerDialog } from "./components/promotion-banner-dialog";
import { PromotionsActionsDropdown } from "./components/promotion-actions-dropdown";

const url = `${process.env.HOST_URL}`;

export default async function AdminPromotionsPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  await auth.api.getSession({
    headers: await headers(),
  });

  const whereClause = search
    ? ilike(promotionTable.title, `%${search}%`)
    : undefined;

  const [{ count: totalPromotions }] = await db
    .select({ count: count() })
    .from(promotionTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalPromotions / limit);

  const promotions = await db.query.promotionTable.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (promotions, { desc }) => [desc(promotions.createdAt)],
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
    params.set("page", page.toString());
    return `/admin/promotions?${params.toString()}`;
  };

  return (
    <AdminLayout>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar todas as promoções
            </p>
          </div>
          <CreatePromotionForm />
        </div>

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead className="min-w-40">Título</TableHead>
                <TableHead className="min-w-48">Descrição</TableHead>
                <TableHead className="min-w-48">Link</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-36">Criada em</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length > 0 ? (
                promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="w-24">
                      {promotion.imageUrl ? (
                        <PromotionBannerDialog
                          src={promotion.imageUrl}
                          alt={promotion.title}
                        />
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{promotion.title}</TableCell>
                    <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                      {promotion.description}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`${url}${promotion.linkUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-56 truncate text-sm text-primary underline"
                      >
                        {url}{promotion.linkUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1.5 px-2 text-muted-foreground"
                      >
                        {promotion.isActive ? (
                          <CircleCheck className="size-3.5 text-emerald-600" />
                        ) : (
                          <CircleX className="size-3.5 text-muted-foreground" />
                        )}
                        {promotion.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(promotion.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <PromotionsActionsDropdown promotion={promotion} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search
                      ? "Nenhuma promoção encontrada com esse filtro."
                      : "Nenhuma promoção cadastrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {totalPromotions === 0 ? 0 : offset + 1}–
            {Math.min(offset + promotions.length, totalPromotions)} de {totalPromotions} promoções
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
