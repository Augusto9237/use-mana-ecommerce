import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { count, and, or, ilike, eq } from "drizzle-orm";
import { userTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CustomerFilters } from "./components/customer-filters";

export default async function AdminCustomersPage(props: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  const search = searchParams.search || "";
  const role = searchParams.role || "";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(userTable.name, `%${search}%`),
        ilike(userTable.email, `%${search}%`)
      )
    );
  }
  if (role && role !== "all") {
    conditions.push(eq(userTable.role, role as "user" | "admin"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count: totalCustomers }] = await db
    .select({ count: count() })
    .from(userTable)
    .where(whereClause);

  const totalPages = Math.ceil(totalCustomers / limit);

  const customers = await db.query.userTable.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

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
    if (role) params.set("role", role);
    return `/admin/customers?${params.toString()}`;
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
                  <BreadcrumbPage className="text-primary">Clientes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl max-sm:text-xl font-bold">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar clientes cadastrados no sistema
            </p>
          </div>
        </div>

        {/* Filtros */}
        <CustomerFilters />

        {/* Table */}
        {customers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Nenhum cliente encontrado com os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const initials = customer.name
                  ? customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "U";

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="w-16">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={customer.image || ""} alt={customer.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge variant={customer.role === "admin" ? "default" : "outline"}>
                        {customer.role === "admin" ? "Administrador" : "Cliente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                );
              })}
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