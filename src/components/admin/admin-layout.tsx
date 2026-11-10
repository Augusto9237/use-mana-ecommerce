"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";

const pageLabels: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/pdv": "PDV",
  "/admin/pdv/confimation": "Confirmar",
  "/admin/orders": "Pedidos",
  "/admin/products": "Produtos",
  "/admin/categories": "Categorias",
  "/admin/customers": "Clientes",
  "/admin/promotions": "Promoções",
  "/admin/settings": "Configurações",

};

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isProductVariantsPage = /^\/admin\/products\/[^/]+\/variants\/?$/.test(
    pathname
  );
  const pageLabel = isProductVariantsPage
    ? "Variantes"
    : (pageLabels[pathname] ?? "Administração");

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4"
              />
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap">
                  {pathname === "/admin" ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink asChild>
                          <Link
                            href={
                              isProductVariantsPage
                                ? "/admin/products"
                                : "/admin"
                            }
                          >
                            {isProductVariantsPage ? "Produtos" : "Painel"}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex shrink-0 items-center gap-2 px-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
                <span className="sr-only">Notificações</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative size-8 rounded-full"
                  >
                    <Avatar className="size-8">
                      <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={session?.user?.name || "Usuário"}
                      />
                      <AvatarFallback>
                        <UserCircle className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Abrir menu do usuário</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {session?.user?.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => authClient.signOut()}
                    variant="destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
