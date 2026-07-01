"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Folder,
  Users,
  Ticket,
  Settings,
  ShoppingBag,
  LogOut,
  Bell,
  Search,
  UserCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Produtos",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: Folder,
  },
  {
    label: "Clientes",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Cupons",
    href: "/admin/coupons",
    icon: Ticket,
  },
  {
    label: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-screen bg-background">
      <TooltipProvider delayDuration={0}>
        <SidebarProvider>
          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content */}
          <div className="flex-1 relative pt-6">
            {/* Top Header */}
            <header className="backdrop-blur-md bg-background/30 fixed right-0 w-[calc(100%-var(--sidebar-width))] top-0 z-10">
              <div className="flex items-center justify-end py-3 px-8">

                {/* Right section */}
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                          <AvatarFallback><UserCircle className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => authClient.signOut()}
                        variant="destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-8">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
