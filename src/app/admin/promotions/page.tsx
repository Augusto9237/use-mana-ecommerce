import { headers } from "next/headers";
import Link from "next/link";

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
import { CreatePromotionForm } from "./components/create-promotion-form";
import Image from "next/image";
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

  const totalPagesCount = await db
    .select({ count: count() })
    .from(promotionTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalPagesCount[0].count / limit);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl max-sm:text-xl font-bold">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar todas as promoções
            </p>
          </div>
          <CreatePromotionForm />
        </div>

        {/* Table */}
        {promotions.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-gray-600 mb-4">Nenhuma promoção cadastrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Imagem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-10">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="w-24">
                      {promotion.imageUrl ? (
                        <PromotionBannerDialog src={promotion.imageUrl} alt={promotion.title} />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{promotion.title}</TableCell>
                    <TableCell>{promotion.description}</TableCell>
                    <TableCell>
                      <a
                        href={`${url}${promotion.linkUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline truncate max-w-[150px] block"
                      >
                        {url}{promotion.linkUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={promotion.isActive ? "default" : "secondary"}>
                        {promotion.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <PromotionsActionsDropdown promotion={promotion} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/admin/promotions?page=${currentPage - 1}`}
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
                        href={`/admin/promotions?page=${page}`}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={`/admin/promotions?page=${currentPage + 1}`}
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
