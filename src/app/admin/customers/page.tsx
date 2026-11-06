import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { count, and, or, ilike, eq } from "drizzle-orm";
import { userTable } from "@/db/schema";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CustomerFilters } from "./components/customer-filters";
import { CreateUserForm } from "@/components/admin/create-user-form";

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
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciar clientes cadastrados no sistema
            </p>
          </div>

          <CreateUserForm/>
        </div>

        {/* Filtros */}
        <CustomerFilters />

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-[720px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead className="min-w-48">Nome</TableHead>
                <TableHead className="min-w-64">E-mail</TableHead>
                <TableHead className="w-40">Perfil</TableHead>
                <TableHead className="w-36">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => {
                  const initials = customer.name
                    ? customer.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()
                    : "U";

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="w-16">
                        <Avatar className="size-9">
                          <AvatarImage
                            src={customer.image || ""}
                            alt={customer.name}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.role === "admin" ? "default" : "outline"}
                          className={customer.role === "admin" ? "" : "px-1.5 text-muted-foreground"}
                        >
                          {customer.role === "admin" ? "Administrador" : "Cliente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search || (role && role !== "all")
                      ? "Nenhum cliente encontrado com esses filtros."
                      : "Nenhum cliente cadastrado."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {totalCustomers === 0 ? 0 : offset + 1}–
            {Math.min(offset + customers.length, totalCustomers)} de {totalCustomers} clientes
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